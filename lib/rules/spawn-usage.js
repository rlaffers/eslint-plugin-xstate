'use strict'
/**
 * This rule is relevant only for XState v4.
 *
 */

const getDocsUrl = require('../utils/getDocsUrl')
const { isFunctionExpression, isIIFE } = require('../utils/predicates')
const XStateDetector = require('../utils/XStateDetector')
const getSettings = require('../utils/getSettings')

// TODO instead of the detector, consider using:
// context.getDeclaredVariables(node)
// context.sourceCode.getScope(node).variables

function isAssignCall(node) {
  return node.type === 'CallExpression' && node.callee.name === 'assign'
}

function isInsideAssignCall(node) {
  let parent = node.parent
  while (parent) {
    if (isAssignCall(parent)) {
      return true
    }
    parent = parent.parent
  }
  return false
}

function isInsideAssignerFunction(node) {
  let parent = node.parent
  while (parent) {
    if (isFunctionExpression(parent) && !isIIFE(parent)) {
      // now search for an assign call ancestor
      return isInsideAssignCall(parent)
    }
    // if there is this assign call without function descdendant, its bad
    if (isAssignCall(parent)) {
      return false
    }
    parent = parent.parent
  }
  return false
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce correct usage of spawn function',
      category: 'Possible Errors',
      url: getDocsUrl('spawn-usage'),
      recommended: true,
    },
    schema: [],
    messages: {
      invalidCallContext:
        'Function "spawn" cannot be called outside of an assignment function.',
    },
  },

  create: function (context) {
    const xstateDetector = new XStateDetector()
    const { version } = getSettings(context)
    if (version !== 4) {
      throw new Error(`Rule "spawn-usage" should be used with XState v4 only! Your XState version: ${version}. Either remove this rule from your ESLint config or set the correct version of XState in the config:
      {
        "settings": {
          "xstate": {
            "version": 4
          }
        }
      }
`)
    }

    return {
      ...xstateDetector.visitors,

      // Ignores it if the spawnIdentifier has not been previously resolved to "spawn" (imported from xstate)
      CallExpression: function (node) {
        if (!xstateDetector.isSpawnCallExpression(node)) {
          return
        }

        if (!isInsideAssignerFunction(node)) {
          context.report({
            node,
            messageId: 'invalidCallContext',
          })
        }
      },
    }
  },
}
