'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'suggest using "always" for eventless transitions',
      category: 'Best Practices',
      url: getDocsUrl('prefer-always'),
      recommended: 'warn',
    },
    schema: [],
    messages: {
      preferAlways:
        'The empty string syntax for transient transitions will be deprecated in XState v5. Prefer using the new "always" syntax available since XState v4.11+.',
      eventlessTransitionsDeprecated:
        'The empty string syntax for transient (eventless) transitions was removed in v5. Use the "always" syntax.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property[key.value=""]':
        function (node) {
          if (version !== 4) {
            context.report({
              node,
              messageId: 'eventlessTransitionsDeprecated',
            })
            return
          }
          context.report({
            node,
            messageId: 'preferAlways',
          })
        },
    }
  },
}
