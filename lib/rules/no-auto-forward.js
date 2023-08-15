'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forbid auto-forwarding events to child actors',
      category: 'Best Practices',
      url: getDocsUrl('no-auto-forward'),
      recommended: 'warn',
    },
    schema: [],
    messages: {
      noAutoForward:
        'Forwarding all events may lead to unexpected behavior and/or infinite loops. Prefer using `forwardTo` action creator to send events explicitly.',
      autoForwardDeprecated:
        'The autoForward option has been removed in v5. Use `forwardTo` action creator to send events explicitly.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"] > ObjectExpression > Property[key.name="autoForward"]':
        function (node) {
          if (version !== 4) {
            context.report({
              node,
              messageId: 'autoForwardDeprecated',
            })
            return
          }
          if (node.value.value === true) {
            context.report({
              node,
              messageId: 'noAutoForward',
            })
          }
        },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.name="spawn"] > ObjectExpression > Property[key.name="autoForward"]':
        function (node) {
          if (version !== 4) {
            context.report({
              node,
              messageId: 'autoForwardDeprecated',
            })
            return
          }
          if (node.value.value === true) {
            context.report({
              node,
              messageId: 'noAutoForward',
            })
          }
        },
    }
  },
}
