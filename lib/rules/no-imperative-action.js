'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

function isActionCreator(name) {
  return ['assign', 'send', 'sendParent', 'respond', 'raise'].includes(name)
}

function isActionCreatorCall(node) {
  return node.type === 'CallExpression' && isActionCreator(node.callee.name)
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce using action creators declaratively',
      category: 'Possible Errors',
      url: getDocsUrl('no-imperative-action'),
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      imperativeActionCreator:
        'Action creator "{{actionCreator}}" cannot be used imperatively. Call it eagerly to create an action object.',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^entry$|^exit$/] ArrowFunctionExpression CallExpression': function (
        node
      ) {
        if (isActionCreatorCall(node)) {
          context.report({
            node,
            messageId: 'imperativeActionCreator',
            data: { actionCreator: node.callee.name },
          })
        }
      },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^entry$|^exit$/] FunctionExpression CallExpression': function (
        node
      ) {
        if (isActionCreatorCall(node)) {
          context.report({
            node,
            messageId: 'imperativeActionCreator',
            data: { actionCreator: node.callee.name },
          })
        }
      },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="actions"] ArrowFunctionExpression CallExpression': function (
        node
      ) {
        if (isActionCreatorCall(node)) {
          context.report({
            node,
            messageId: 'imperativeActionCreator',
            data: { actionCreator: node.callee.name },
          })
        }
      },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="actions"] FunctionExpression CallExpression': function (
        node
      ) {
        if (isActionCreatorCall(node)) {
          context.report({
            node,
            messageId: 'imperativeActionCreator',
            data: { actionCreator: node.callee.name },
          })
        }
      },
    }
  },
}