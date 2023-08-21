'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  isFunctionExpression,
  isArrayExpression,
  isObjectExpression,
} = require('../utils/predicates')
const getSettings = require('../utils/getSettings')

const validChooseActionProperty = {
  4: ['cond', 'actions'],
  5: ['guard', 'actions'],
}
function isValidChooseActionProperty(property, version) {
  return (
    validChooseActionProperty[version] &&
    validChooseActionProperty[version].includes(property.key.name)
  )
}

const propertyOfChoosableActionObject =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.name="choose"] > ArrayExpression > ObjectExpression > Property'
const chooseFunctionCall =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.name="choose"]'

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'forbid invalid usage of the "choose" action creator',
      category: 'Possible Errors',
      url: getDocsUrl('no-invalid-conditional-action'),
      recommended: true,
    },
    schema: [],
    messages: {
      invalidConditionalActionProperty:
        '"{{propName}}" is not a valid property for a conditional action.',
      invalidArgumentForChoose:
        '"{{argType}}" cannot be passed to the "choose" action creator. Pass an array instead.',
      missingFirstArgumentForChoose:
        'The "choose" action creator requires an argument.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)

    return {
      [propertyOfChoosableActionObject]:
        function checkChooseActionObjectProperty(node) {
          if (!isValidChooseActionProperty(node, version)) {
            context.report({
              node,
              messageId: 'invalidConditionalActionProperty',
              data: { propName: node.key.name },
            })
          }
        },
      [chooseFunctionCall]: function checkChooseFirstArgument(node) {
        if (node.arguments.length < 1) {
          context.report({
            node,
            messageId: 'missingFirstArgumentForChoose',
          })
          return
        }
        const firstArgument = node.arguments[0]
        if (isArrayExpression(firstArgument)) {
          return
        }
        if (isObjectExpression(firstArgument)) {
          context.report({
            node,
            messageId: 'invalidArgumentForChoose',
            data: { argType: 'object' },
          })
          return
        }
        if (firstArgument.type === 'Literal') {
          context.report({
            node,
            messageId: 'invalidArgumentForChoose',
            data: {
              argType:
                firstArgument.value === null
                  ? 'null'
                  : typeof firstArgument.value,
            },
          })
          return
        }
        if (isFunctionExpression(firstArgument)) {
          context.report({
            node,
            messageId: 'invalidArgumentForChoose',
            data: { argType: 'function' },
          })
          return
        }
        if (firstArgument.type === 'Identifier') {
          context.report({
            node,
            messageId: 'invalidArgumentForChoose',
            data: {
              argType:
                firstArgument.name === 'undefined' ? 'undefined' : 'identifier',
            },
          })
          return
        }

        context.report({
          node,
          messageId: 'invalidArgumentForChoose',
          data: { argType: firstArgument.type },
        })
      },
    }
  },
}
