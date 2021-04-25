'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

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
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"] > ObjectExpression > Property[key.name="autoForward"]': function (
        node
      ) {
        if (node.value.value === true) {
          context.report({
            node,
            messageId: 'noAutoForward',
          })
        }
      },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.name="spawn"] > ObjectExpression > Property[key.name="autoForward"]': function (
        node
      ) {
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
