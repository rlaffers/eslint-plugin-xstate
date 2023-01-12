'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

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
    schema: [],
    messages: {
      preferPredictableActionArguments:
        'It is advised to configure predictableActionArguments: true at the top-level of your machine config',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:first-child':
        function (node) {
          const predictableActionArgumentsProperty = node.properties.find(
            (prop) => {
              return prop.key.name === 'predictableActionArguments'
            }
          )

          const hasPredictableActionArgumentsProperty = Boolean(
            predictableActionArgumentsProperty
          )

          if (!hasPredictableActionArgumentsProperty) {
            context.report({
              node,
              messageId: 'preferPredictableActionArguments',
            })
            return
          }

          const isPredictableActionArgumentsTruthy =
            hasPredictableActionArgumentsProperty &&
            predictableActionArgumentsProperty.value.value === true

          if (!isPredictableActionArgumentsTruthy) {
            context.report({
              node,
              messageId: 'preferPredictableActionArguments',
            })
          }
        },
    }
  },
}
