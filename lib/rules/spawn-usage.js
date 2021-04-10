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
  return node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression'
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
  // TODO setup unit tests
  // TODO what is meta for?
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce correct usage of spawn function',
      category: 'Possible Errors',
      url: getDocsUrl('spawn-usage'),
    },
    schema: [],
    // define messages for message IDs
    // messages: {
    // myMessages: 'This is the message'
    // },
  },

  create: function (context) {
    return {
      // TODO rules:
      // 1. spawn must be used inside assign
      // 2. must not be called in the context of machine
      // 3. first argument must be machine, promise, cb or observable
      // 4. optional second argument is string or an object
      CallExpression: function (node) {
        if (node.callee.name === 'spawn') {
          if (!isInsideAssignerFunction(node)) {
            context.report({
              node,
              message: 'Function "spawn" cannot be called outside of an assigner function.',
            })
          }
          // TODO check that the function assigner is used
        }
      },
    }
  },
}
