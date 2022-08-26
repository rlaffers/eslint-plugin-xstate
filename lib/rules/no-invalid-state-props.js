'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  propertyHasName,
  propertyHasValue,
  isObjectExpression,
  hasProperty,
} = require('../utils/predicates')
const { allPass } = require('../utils/combinators')

const validProperties = [
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
]
function isValidStateProperty(property) {
  return validProperties.includes(property.key.name)
}

const validRootProperties = [
  'after',
  'context',
  'entry',
  'history', // only when type=history
  'id',
  'initial',
  'invoke',
  'meta',
  'on',
  'states',
  'tags',
  'target', // only when type=history
  'type',
  'strict',
  'preserveActionOrder',
  'description',
  'schema',
  'tsTypes',
]
function isValidRootStateProperty(property) {
  return validRootProperties.includes(property.key.name)
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

const stateDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] > ObjectExpression > Property > ObjectExpression'

const rootStateDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:first-child'

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
    return {
      [stateDeclaration]: function (node) {
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

          if (!isValidStateProperty(prop)) {
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

      [rootStateDeclaration]: function (node) {
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

          if (!isValidRootStateProperty(prop)) {
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
      },
    }
  },
}
