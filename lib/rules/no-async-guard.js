'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isFunctionExpression } = require('../utils/predicates')

function isAsyncFunctionExpression(node) {
  return isFunctionExpression(node) && node.async
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'forbid asynchronous guard functions',
      category: 'Possible Errors',
      url: getDocsUrl('no-async-guard'),
      recommended: true,
    },
    schema: [],
    messages: {
      guardCannotBeAsync: 'Guard cannot be an asynchronous function.',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="cond"]':
        function (node) {
          if (isAsyncFunctionExpression(node.value)) {
            context.report({
              node: node.value,
              messageId: 'guardCannotBeAsync',
            })
          }
        },
      'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:nth-child(2) > Property[key.name="guards"] > ObjectExpression > Property':
        function (node) {
          if (isAsyncFunctionExpression(node.value)) {
            context.report({
              node: node.value,
              messageId: 'guardCannotBeAsync',
            })
          }
        },
    }
  },
}
