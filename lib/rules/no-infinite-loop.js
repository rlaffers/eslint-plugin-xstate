'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const isInsideMachineDeclaration = require('../utils/isInsideMachineDeclaration')
const {
  isFirstArrayItem,
  propertyHasName,
  hasProperty,
} = require('../utils/commonMatchers')

function isEventlessTransitionDeclaration(node) {
  return node.type === 'Property' && node.key.name === 'always'
}

function findParentStateNode(transition) {
  let node = transition.parent
  while (!isEventlessTransitionDeclaration(node)) {
    node = node.parent
  }
  if (!node) {
    return null
  }
  return node.parent.parent
}

function getStateNodeID(node) {
  if (node.type !== 'Property') {
    return null
  }
  const idProp = node.value.properties.find(propertyHasName('id'))
  if (!idProp) {
    return null
  }
  return idProp.value.value
}

function isID(string) {
  return /^#\w+/.test(string)
}

function isUnconditionalTransitionToItself(transition) {
  if (!hasProperty('target', transition) || hasProperty('cond', transition)) {
    return false
  }
  const targetStateNodeNameOrID = transition.properties.find(
    propertyHasName('target')
  ).value.value
  const parentStateNode = findParentStateNode(transition)
  const parentStateNodeNameOrID = isID(targetStateNodeNameOrID)
    ? getStateNodeID(parentStateNode)
    : parentStateNode.key.name
  return targetStateNodeNameOrID === parentStateNodeNameOrID
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'detect infnite loops in eventless transitions',
      category: 'Possible Errors',
      url: getDocsUrl('no-infinite-loop'),
      recommended: true,
    },
    schema: [],
    messages: {
      noTargetNoGuard:
        'Eventless transition cannot have no target and no guard. This will result in an infinite loop error.',
      noTargetNoGuardMaybeTaken:
        'Eventless transition cannot have no target and no guard. This may result in an infinite loop error if no previous transition is taken.',
      unconditionalTransitionToItself:
        'Eventless transition cannot target its own state node unconditionally. This will result in an infinite loop error.',
      unconditionalTransitionToItselfMaybeTaken:
        'Eventless transition cannot not target its own state node unconditionally. This may result in an infinite loop error if no previous transition is taken.',
    },
  },

  create: function (context) {
    return {
      // always: {}
      // always: { actions: whatever}
      'Property[key.name="always"] > ObjectExpression': function (node) {
        if (!isInsideMachineDeclaration(node)) {
          return
        }
        if (!hasProperty('target', node) && !hasProperty('cond', node)) {
          context.report({
            node,
            messageId: 'noTargetNoGuard',
          })
        }
      },

      'Property[key.name="always"] > ArrayExpression > ObjectExpression': function (
        node
      ) {
        if (!isInsideMachineDeclaration(node)) {
          return
        }
        // always: [{}]
        // always: [{ actions: whatever }]
        if (!hasProperty('target', node) && !hasProperty('cond', node)) {
          if (isFirstArrayItem(node)) {
            context.report({
              node,
              messageId: 'noTargetNoGuard',
            })
            return
          }
          context.report({
            node,
            messageId: 'noTargetNoGuardMaybeTaken',
          })
          return
        }

        // idle: {
        //   always: { target: 'idle' }
        // }
        // or
        // idle: [{
        //   always: { target: 'idle' }
        // }]
        if (isUnconditionalTransitionToItself(node)) {
          if (isFirstArrayItem(node)) {
            context.report({
              node,
              messageId: 'unconditionalTransitionToItself',
            })
            return
          }
          context.report({
            node,
            messageId: 'unconditionalTransitionToItselfMaybeTaken',
          })
          // return
        }
      },
    }
  },
}
