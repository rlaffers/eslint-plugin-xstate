'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'suggest using "preferPredictableActionArguments": true for at the top level of machine',
      category: 'Best Practices',
      url: getDocsUrl('prefer-predictable-action-arguments'),
      recommended: 'warn',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferPredictableActionArguments:
        'It is advised to configure predictableActionArguments: true at the top-level of your machine config',
      deprecatedPredictableActionArguments:
        'The predictableActionArguments prop was removed in XState v5 so it has no effect. Please remove it.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:first-child':
        function (node) {
          const predictableActionArgumentsProperty = node.properties.find(
            (prop) => {
              return prop.key.name === 'predictableActionArguments'
            }
          )
          if (version > 4) {
            if (!predictableActionArgumentsProperty) {
              return
            }
            context.report({
              node: predictableActionArgumentsProperty,
              messageId: 'deprecatedPredictableActionArguments',
              fix(fixer) {
                return fixer.remove(predictableActionArgumentsProperty)
              },
            })
            return
          }

          if (!predictableActionArgumentsProperty) {
            if (node.properties.length === 0) {
              context.report({
                node,
                messageId: 'preferPredictableActionArguments',
                fix(fixer) {
                  return fixer.replaceText(
                    node,
                    '{ predictableActionArguments: true }'
                  )
                },
              })
            } else {
              context.report({
                node,
                messageId: 'preferPredictableActionArguments',
                fix(fixer) {
                  return fixer.insertTextBefore(
                    node.properties[0],
                    'predictableActionArguments: true,\n'
                  )
                },
              })
            }
            return
          }

          if (
            !predictableActionArgumentsProperty.value ||
            predictableActionArgumentsProperty.value.value !== true
          ) {
            context.report({
              node: predictableActionArgumentsProperty,
              messageId: 'preferPredictableActionArguments',
              fix(fixer) {
                return fixer.replaceText(
                  predictableActionArgumentsProperty.value,
                  'true'
                )
              },
            })
          }
        },
    }
  },
}
