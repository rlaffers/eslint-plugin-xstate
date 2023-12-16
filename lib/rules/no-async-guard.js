'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isFunctionExpression } = require('../utils/predicates')
const getSettings = require('../utils/getSettings')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

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
    const prefix = getSelectorPrefix(context.sourceCode)

    function checkInlineGuard(node) {
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
    }

    function checkGuardImplementation(node) {
      if (isAsyncFunctionExpression(node.value)) {
        context.report({
          node: node.value,
          messageId: 'guardCannotBeAsync',
        })
      }
    }

    return prefix === ''
      ? {
          'Property[key.name=/^cond|guard$/]': checkInlineGuard,
          'Property[key.name="guards"] > ObjectExpression > Property':
            checkGuardImplementation,
        }
      : {
          [`${prefix}> ObjectExpression:first-child Property[key.name=/^cond|guard$/]`]:
            checkInlineGuard,
          [`${prefix}> ObjectExpression:nth-child(2) > Property[key.name="guards"] > ObjectExpression > Property`]:
            checkGuardImplementation,
        }
  },
}
