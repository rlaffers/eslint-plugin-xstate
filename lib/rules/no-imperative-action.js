'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')

const {
  isKnownActionCreatorCall,
  isCreateMachineCall,
  isCallExpression,
} = require('../utils/predicates')

function isPureActionCall(node) {
  return (
    (node.type === 'CallExpression' && node.callee.name === 'pure') ||
    (node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'actions' &&
      node.callee.property.name === 'pure')
  )
}

function isWithinPureActionCreator(node) {
  let parent = node.parent
  while (parent) {
    if (isCreateMachineCall(parent)) {
      return false
    }
    if (isPureActionCall(parent)) {
      return true
    }
    parent = parent.parent
  }
  return false
}

function getActionCreatorName(node) {
  if (!isCallExpression(node)) {
    return undefined
  }
  if (node.callee.type === 'MemberExpression') {
    return `${node.callee.object.name}.${node.callee.property.name}`
  }
  return node.callee.name
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
    schema: [],
    messages: {
      imperativeActionCreator:
        'Action creator "{{actionCreator}}" cannot be used imperatively. Call it eagerly to create an action object.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^entry$|^exit$/] ArrowFunctionExpression CallExpression':
        function (node) {
          if (
            isKnownActionCreatorCall(node, version) &&
            !isWithinPureActionCreator(node)
          ) {
            context.report({
              node,
              messageId: 'imperativeActionCreator',
              data: { actionCreator: getActionCreatorName(node) },
            })
          }
        },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^entry$|^exit$/] FunctionExpression CallExpression':
        function (node) {
          if (
            isKnownActionCreatorCall(node, version) &&
            !isWithinPureActionCreator(node)
          ) {
            context.report({
              node,
              messageId: 'imperativeActionCreator',
              data: { actionCreator: getActionCreatorName(node) },
            })
          }
        },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="actions"] ArrowFunctionExpression CallExpression':
        function (node) {
          if (
            isKnownActionCreatorCall(node, version) &&
            !isWithinPureActionCreator(node)
          ) {
            context.report({
              node,
              messageId: 'imperativeActionCreator',
              data: { actionCreator: getActionCreatorName(node) },
            })
          }
        },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="actions"] FunctionExpression CallExpression':
        function (node) {
          if (
            isKnownActionCreatorCall(node, version) &&
            !isWithinPureActionCreator(node)
          ) {
            context.report({
              node,
              messageId: 'imperativeActionCreator',
              data: { actionCreator: getActionCreatorName(node) },
            })
          }
        },
    }
  },
}
