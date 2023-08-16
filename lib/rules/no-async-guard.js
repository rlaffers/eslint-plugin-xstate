'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isFunctionExpression } = require('../utils/predicates')
const getSettings = require('../utils/getSettings')

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
    const { version } = getSettings(context)
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:first-child Property[key.name=/^cond|guard$/]':
        function (node) {
          if (version === 4 && node.key.name !== 'cond') {
            return
          }
          if (version > 4 && node.key.name !== 'guard') {
            return
          }
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
