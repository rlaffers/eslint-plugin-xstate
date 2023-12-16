'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isObjectExpression, isArrayExpression } = require('../utils/predicates')
const getSettings = require('../utils/getSettings')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

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
const eventTransitionDeclaration = (prefix) =>
  `${prefix}ObjectExpression > Property[key.name="on"] > ObjectExpression > Property`

// e.g.
// states: { idle: { on: [ { event: 'EVENT', target: 'active' } ]}}
const eventTransitionArrayDeclaration = (prefix) =>
  `${prefix}ObjectExpression > Property[key.name="on"] > ArrayExpression`

const onDoneOrOnErrorTransitionDeclaration = (prefix) =>
  `${prefix}Property[key.name=/^onDone$|^onError$/]`

const alwaysTransitionDeclaration = (prefix) =>
  `${prefix}Property[key.name="states"] > ObjectExpression > Property > ObjectExpression > Property[key.name="always"] > ArrayExpression`

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
    const prefix = getSelectorPrefix(context.sourceCode)
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
      [eventTransitionDeclaration(prefix)]: checkTransitionDeclaration,

      [eventTransitionArrayDeclaration(prefix)]:
        checkTransitionArrayDeclaration,

      [onDoneOrOnErrorTransitionDeclaration(prefix)]:
        checkTransitionDeclaration,
      [alwaysTransitionDeclaration(prefix)]: checkTransitionArrayDeclaration,
    }
  },
}
