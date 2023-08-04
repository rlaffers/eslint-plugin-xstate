'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { getTypeProperty } = require('../utils/selectors')
const { hasProperty, isWithinInvoke } = require('../utils/predicates')

function isWithinCompoundStateNode(node) {
  const stateNode = node.parent
  const type = getTypeProperty(stateNode)
  return (
    hasProperty('initial', stateNode) ||
    (type != null && type.value.value === 'compound')
  )
}

function isWithinParallelStateNode(node) {
  const stateNode = node.parent
  const type = getTypeProperty(stateNode)
  return type != null && type.value.value === 'parallel'
}

function isWithinAtomicStateNode(node) {
  const stateNode = node.parent
  const type = getTypeProperty(stateNode)
  return type != null && type.value.value === 'atomic'
}

function isWithinHistoryStateNode(node) {
  const stateNode = node.parent
  const type = getTypeProperty(stateNode)
  return type != null && type.value.value === 'history'
}

function isWithinFinalStateNode(node) {
  const stateNode = node.parent
  const type = getTypeProperty(stateNode)
  return type != null && type.value.value === 'final'
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'forbid onDone transitions in state nodes other than compound/parallel',
      category: 'Possible Errors',
      url: getDocsUrl('no-ondone-outside-compound-state'),
      recommended: true,
    },
    schema: [],
    messages: {
      onDoneOnAtomicStateForbidden:
        'Atomic state nodes cannot have an "onDone" transition. The "onDone" transition has effect only in compound/parallel state nodes or in service invocations.',
      onDoneOnHistoryStateForbidden:
        'History state nodes cannot have an "onDone" transition. The "onDone" transition has effect only in compound/parallel state nodes or in service invocations.',
      onDoneOnFinalStateForbidden:
        'Final state nodes cannot have an "onDone" transition. The "onDone" transition has effect only in compound/parallel state nodes or in service invocations.',
      onDoneUsedIncorrectly:
        'The "onDone" transition cannot be used here. The "onDone" transition has effect only in compound/parallel state nodes or in service invocations.',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="onDone"]':
        function (node) {
          if (isWithinInvoke(node)) {
            return
          }
          if (isWithinCompoundStateNode(node)) {
            return
          }
          if (isWithinParallelStateNode(node)) {
            return
          }
          if (isWithinAtomicStateNode(node)) {
            context.report({
              node,
              messageId: 'onDoneOnAtomicStateForbidden',
            })
            return
          }
          if (isWithinHistoryStateNode(node)) {
            context.report({
              node,
              messageId: 'onDoneOnHistoryStateForbidden',
            })
            return
          }
          if (isWithinFinalStateNode(node)) {
            context.report({
              node,
              messageId: 'onDoneOnFinalStateForbidden',
            })
            return
          }
          context.report({
            node,
            messageId: 'onDoneUsedIncorrectly',
          })
        },
    }
  },
}
