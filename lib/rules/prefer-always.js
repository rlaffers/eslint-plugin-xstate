'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

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
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property[key.value=""]': function (
        node
      ) {
        context.report({
          node,
          messageId: 'preferAlways',
        })
      },
    }
  },
}
