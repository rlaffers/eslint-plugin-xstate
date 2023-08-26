'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')
const { hasProperty } = require('../utils/predicates')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

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
    const prefix = getSelectorPrefix(context.sourceCode)
    const { version } = getSettings(context)

    function check(node) {
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
    }

    return prefix !== ''
      ? {
          [`${prefix}> ObjectExpression:first-child`]: check,
        }
      : {
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
            return check(node)
          },
        }
  },
}
