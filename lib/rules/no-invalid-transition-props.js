'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isObjectExpression, isArrayExpression } = require('../utils/predicates')
const getSettings = require('../utils/getSettings')

const validTransitionProperties = {
  4: ['target', 'cond', 'actions', 'in', 'internal', 'description'],
  5: ['target', 'guard', 'actions', 'reenter', 'description'],
}

function isValidTransitionProperty(property, version) {
  return (
    validTransitionProperties[version] &&
    validTransitionProperties[version].includes(property.key.name)
  )
}

// e.g.
// states: { idle: { on: { EVENT: { target: 'active' }}}}
// states: { idle: { on: { EVENT: [{ target: 'active' }]}}}
const eventTransitionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] > ObjectExpression > Property > ObjectExpression > Property[key.name="on"] > ObjectExpression > Property'

const globalEventTransitionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression > Property[key.name="on"] > ObjectExpression > Property'

// e.g.
// states: { idle: { on: [ { event: 'EVENT', target: 'active' } ]}}
const eventTransitionArrayDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] > ObjectExpression > Property > ObjectExpression > Property[key.name="on"] > ArrayExpression'

const globalEventTransitionArrayDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression > Property[key.name="on"] > ArrayExpression'

const onDoneOrOnErrorTransitionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^onDone$|^onError$/]'

const alwaysTransitionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] > ObjectExpression > Property > ObjectExpression > Property[key.name="always"] > ArrayExpression'

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'forbid invalid properties in transition declarations',
      category: 'Possible Errors',
      url: getDocsUrl('no-invalid-transition-props'),
      recommended: true,
    },
    schema: [],
    messages: {
      invalidTransitionProperty:
        '"{{propName}}" is not a valid property for a transition declaration.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)
    function checkTransitionDeclaration(node) {
      const transitionValue = node.value
      if (isObjectExpression(transitionValue)) {
        transitionValue.properties.forEach((prop) => {
          if (!isValidTransitionProperty(prop, version)) {
            context.report({
              node: prop,
              messageId: 'invalidTransitionProperty',
              data: { propName: prop.key.name },
            })
          }
        })
        return
      }

      if (isArrayExpression(transitionValue)) {
        transitionValue.elements.forEach((transitionObject) => {
          if (!isObjectExpression(transitionObject)) {
            return
          }
          transitionObject.properties.forEach((prop) => {
            if (!isValidTransitionProperty(prop, version)) {
              context.report({
                node: prop,
                messageId: 'invalidTransitionProperty',
                data: { propName: prop.key.name },
              })
            }
          })
        })
      }
    }

    function checkTransitionArrayDeclaration(node) {
      node.elements.forEach((transitionObject) => {
        if (!isObjectExpression(transitionObject)) {
          return
        }
        transitionObject.properties.forEach((prop) => {
          if (
            prop.key.name !== 'event' &&
            !isValidTransitionProperty(prop, version)
          ) {
            context.report({
              node: prop,
              messageId: 'invalidTransitionProperty',
              data: { propName: prop.key.name },
            })
          }
        })
      })
    }

    return {
      [eventTransitionDeclaration]: checkTransitionDeclaration,
      [globalEventTransitionDeclaration]: checkTransitionDeclaration,

      [eventTransitionArrayDeclaration]: checkTransitionArrayDeclaration,
      [globalEventTransitionArrayDeclaration]: checkTransitionArrayDeclaration,

      [onDoneOrOnErrorTransitionDeclaration]: checkTransitionDeclaration,
      [alwaysTransitionDeclaration]: checkTransitionArrayDeclaration,
    }
  },
}
