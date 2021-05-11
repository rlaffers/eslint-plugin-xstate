'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'forbid onDone transition on root state node',
      category: 'Possible Errors',
      url: getDocsUrl('no-root-ondone'),
      recommended: true,
    },
    schema: [],
    messages: {
      rootOnDoneIsForbidden: 'Root nodes cannot have an ".onDone" transition.',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:first-child > Property[key.name="onDone"]':
        function (node) {
          context.report({
            node,
            messageId: 'rootOnDoneIsForbidden',
          })
        },
    }
  },
}
