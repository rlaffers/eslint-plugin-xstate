'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  propertyHasName,
  propertyHasValue,
  isObjectExpression,
  hasProperty,
} = require('../utils/predicates')
const { allPass } = require('../utils/combinators')
const getSettings = require('../utils/getSettings')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

const validProperties = {
  4: [
    'after',
    'always',
    'entry',
    'exit',
    'history', // only when type=history
    'id',
    'initial',
    'invoke',
    'meta',
    'on',
    'onDone',
    'states',
    'tags',
    'target', // only when type=history
    'type',
    'data',
    'description',
    'activities',
  ],
  5: [
    'after',
    'always',
    'entry',
    'exit',
    'history', // only when type=history
    'id',
    'initial',
    'invoke',
    'meta',
    'on',
    'onDone',
    'states',
    'tags',
    'target', // only when type=history
    'type',
    'description',
    'output',
  ],
}

function isValidStateProperty(property, version) {
  return (
    validProperties[version] &&
    validProperties[version].includes(property.key.name)
  )
}

const validRootProperties = {
  4: [
    'after',
    'context',
    'description',
    'entry',
    'exit',
    'history', // only when type=history
    'id',
    'initial',
    'invoke',
    'meta',
    'on',
    'predictableActionArguments',
    'preserveActionOrder',
    'schema',
    'states',
    'strict',
    'tags',
    'target', // only when type=history
    'tsTypes',
    'type',
  ],
  5: [
    'after',
    'context',
    'description',
    'entry',
    'exit',
    'history', // only when type=history
    'id',
    'initial',
    'invoke',
    'meta',
    'on',
    'states',
    'tags',
    'target', // only when type=history
    'types',
    'type',
    'output',
  ],
}
function isValidRootStateProperty(property, version) {
  return (
    validRootProperties[version] &&
    validRootProperties[version].includes(property.key.name)
  )
}

function hasHistoryTypeProperty(node) {
  return (
    isObjectExpression(node) &&
    node.properties.some(
      allPass([propertyHasName('type'), propertyHasValue('history')])
    )
  )
}

function hasCompoundTypeProperty(node) {
  return node.properties.some(
    allPass([propertyHasName('type'), propertyHasValue('compound')])
  )
}

function isCompoundState(node) {
  return (
    isObjectExpression(node) &&
    (hasCompoundTypeProperty(node) || !hasProperty('type', node))
  )
}

const validTypes = ['atomic', 'compound', 'parallel', 'history', 'final']
function isValidTypePropertyValue(node) {
  return node.type === 'Literal' && validTypes.includes(node.value)
}

const validHistoryTypes = ['shallow', 'deep']
function isValidHistoryPropertyValue(node) {
  return node.type === 'Literal' && validHistoryTypes.includes(node.value)
}

function validateTypePropertyValue(prop, context) {
  if (prop.key.name === 'type' && !isValidTypePropertyValue(prop.value)) {
    context.report({
      node: prop,
      messageId: 'invalidTypeValue',
      data: {
        value:
          prop.value.type === 'Literal' ? prop.value.value : prop.value.type,
      },
    })
    return false
  }
  return true
}

function validateHistoryPropertyValue(prop, context) {
  if (prop.key.name === 'history' && !isValidHistoryPropertyValue(prop.value)) {
    context.report({
      node: prop,
      messageId: 'invalidHistoryValue',
      data: {
        value:
          prop.value.type === 'Literal' ? prop.value.value : prop.value.type,
      },
    })
    return false
  }
  return true
}

const stateDeclaration = (prefix) =>
  `${prefix}Property[key.name="states"] > ObjectExpression > Property > ObjectExpression`

// Without createMachine we have no way of checking whether an ObjectExpression is root state node
const rootStateDeclaration = (prefix) =>
  `${prefix}> ObjectExpression:first-child`

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'forbid invalid properties in state node declarations',
      category: 'Possible Errors',
      url: getDocsUrl('no-invalid-state-props'),
      recommended: true,
    },
    schema: [],
    messages: {
      invalidStateProperty:
        '"{{propName}}" is not a valid property for a state declaration.',
      invalidRootStateProperty:
        '"{{propName}}" is not a valid property for the root state node.',
      propAllowedOnHistoryStateOnly:
        'Property "{{propName}}" is valid only on a "history" type state node.',
      invalidTypeValue:
        'Type "{{value}}" is invalid. Use one of: "atomic", "compound", "parallel", "history", "final".',
      invalidHistoryValue:
        'The history type of "{{value}}" is invalid. Use one of: "shallow", "deep".',
      contextAllowedOnlyOnRootNodes:
        'The "context" property cannot be declared on non-root state nodes.',
      initialAllowedOnlyOnCompoundNodes:
        'The "initial" property can be declared on compound state nodes only.',
    },
  },

  create: function (context) {
    const prefix = getSelectorPrefix(context.sourceCode)
    const { version } = getSettings(context)
    return {
      [stateDeclaration(prefix)]: function (node) {
        const isHistoryNode = hasHistoryTypeProperty(node)
        const isCompoundStateNode = isCompoundState(node)
        node.properties.forEach((prop) => {
          if (
            !isHistoryNode &&
            (prop.key.name === 'history' || prop.key.name === 'target')
          ) {
            context.report({
              node: prop,
              messageId: 'propAllowedOnHistoryStateOnly',
              data: { propName: prop.key.name },
            })
            return
          }

          if (prop.key.name === 'context') {
            context.report({
              node: prop,
              messageId: 'contextAllowedOnlyOnRootNodes',
            })
            return
          }

          if (prop.key.name === 'initial' && !isCompoundStateNode) {
            context.report({
              node: prop,
              messageId: 'initialAllowedOnlyOnCompoundNodes',
            })
            return
          }

          if (!isValidStateProperty(prop, version)) {
            context.report({
              node: prop,
              messageId: 'invalidStateProperty',
              data: { propName: prop.key.name },
            })
            return
          }

          if (!validateTypePropertyValue(prop, context)) {
            return
          }

          validateHistoryPropertyValue(prop, context)
        })
      },

      ...(prefix !== ''
        ? {
            [rootStateDeclaration(prefix)]: checkRootNode,
          }
        : {
            // If the createMachine prefix cannot be considered, we search for
            // root state nodes by some tell-tale props: context, types
            // In case of XState v4: context, tsTypes, schema
            ObjectExpression(node) {
              // check if it is a root state node config
              if (
                version === 4 &&
                !(
                  hasProperty('context', node) ||
                  hasProperty('tsTypes', node) ||
                  hasProperty('schema', node)
                )
              ) {
                return false
              }
              if (
                version === 5 &&
                !(hasProperty('context', node) || hasProperty('types', node))
              ) {
                return false
              }
              return checkRootNode(node)
            },
          }),
    }

    function checkRootNode(node) {
      const isHistoryNode = hasHistoryTypeProperty(node)
      const isCompoundStateNode = isCompoundState(node)
      node.properties.forEach((prop) => {
        if (
          !isHistoryNode &&
          (prop.key.name === 'history' || prop.key.name === 'target')
        ) {
          context.report({
            node: prop,
            messageId: 'propAllowedOnHistoryStateOnly',
            data: { propName: prop.key.name },
          })
          return
        }

        if (prop.key.name === 'initial' && !isCompoundStateNode) {
          context.report({
            node: prop,
            messageId: 'initialAllowedOnlyOnCompoundNodes',
          })
          return
        }

        if (!isValidRootStateProperty(prop, version)) {
          context.report({
            node: prop,
            messageId: 'invalidRootStateProperty',
            data: { propName: prop.key.name },
          })
          return
        }

        if (!validateTypePropertyValue(prop, context)) {
          return
        }

        validateHistoryPropertyValue(prop, context)
      })
    }
  },
}
