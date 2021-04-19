'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { getTypeProperty } = require('../utils/selectors')
const { hasProperty } = require('../utils/predicates')

function isWithinInvoke(property) {
  const parentProp = property.parent.parent
  return parentProp.type === 'Property' && parentProp.key.name === 'invoke'
}

function isWithinAtomicStateNode(node) {
  const stateNode = node.parent
  const type = getTypeProperty(stateNode)
  return (
    !isWithinInvoke(node) &&
    ((type != null && type.value.value === 'atomic') ||
      (type == null && !hasProperty('initial', stateNode)))
  )
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
        'forbid onDone transition state nodes other than compound/parellel',
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
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="onDone"]': function (
        node
      ) {
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
        }
      },
    }
  },
}
