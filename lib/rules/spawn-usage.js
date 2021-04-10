'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

function isAssignCall(node) {
  if (node.type === 'CallExpression' && node.callee.name === 'assign') {
    return true
  }
  return false
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

function isFunctionExpression(node) {
  return (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  )
}

function isIIFE(node) {
  const parent = node.parent
  return (
    isFunctionExpression(node) &&
    parent &&
    parent.type === 'CallExpression' &&
    parent.callee === node
  )
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
    // TODO it's possible that a function expression inside assigner function
    // does not get called, so nothing is ever spawned
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
    },
    schema: [],
    messages: {
      invalidCallContext:
        'Function "spawn" cannot be called outside of an assignment function.',
    },
  },

  create: function (context) {
    return {
      CallExpression: function (node) {
        if (node.callee.name === 'spawn') {
          if (!isInsideAssignerFunction(node)) {
            context.report({
              node,
              messageId: 'invalidCallContext',
            })
          }
        }
      },
    }
  },
}
