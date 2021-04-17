'use strict'

const { pipe, map, fromMaybe, Just, Nothing } = require('sanctuary')
const { allPass, complement } = require('../utils/combinators')
const getDocsUrl = require('../utils/getDocsUrl')
const isInsideMachineDeclaration = require('../utils/isInsideMachineDeclaration')
const {
  isFirstArrayItem,
  propertyHasName,
  hasProperty,
  isFunctionExpression,
  isStringLiteralOrIdentifier,
} = require('../utils/predicates')

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

function isTransitionToItself(transition) {
  if (!hasProperty('target', transition)) {
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

function isAssignCall(node) {
  return node.type === 'CallExpression' && node.callee.name === 'assign'
}

function hasAssignAction(transition) {
  if (!hasProperty('actions', transition)) {
    return false
  }
  const actionsValue = transition.properties.find(propertyHasName('actions'))
    .value
  if (isAssignCall(actionsValue)) {
    return true
  }
  return (
    actionsValue.type === 'ArrayExpression' &&
    actionsValue.elements.some(isAssignCall)
  )
}

function actionsContainStringLiteralOrIdentifier(transition) {
  if (!hasProperty('actions', transition)) {
    return false
  }
  const actions = transition.properties.find(propertyHasName('actions')).value
  if (isStringLiteralOrIdentifier(actions)) {
    return true
  }
  return (
    actions.type === 'ArrayExpression' &&
    actions.elements.some(isStringLiteralOrIdentifier)
  )
}

function getGuard(transition) {
  if (!hasProperty('cond', transition)) {
    return Nothing
  }
  const guard = transition.properties.find(propertyHasName('cond')).value
  if (!guard) {
    return Nothing
  }
  return Just(guard)
}

const guardUsesContext = (guardFunctionExpression) =>
  guardFunctionExpression.params.length > 0

const guardIsFunctionAndNotCheckingContext = pipe([
  getGuard,
  map(allPass([isFunctionExpression, complement(guardUsesContext)])),
  fromMaybe(false),
])

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'detect infnite loops with eventless transitions',
      category: 'Possible Errors',
      url: getDocsUrl('no-infinite-loop'),
      recommended: true,
    },
    schema: [],
    messages: {
      noTargetNoGuardIsSingle:
        'A single eventless transition cannot have no target and no guard. This will cause an infinite loop error.',
      noTargetNoGuardIsFirst:
        'The first eventless transition cannot have no target and no guard. This will cause an infinite loop error.',
      emptyTransitionNotFirst:
        'An empty eventless transition is useless and potentially faulty. This will cause an infinite loop error if no previous transition is taken.',
      unconditionalTransitionNoTargetActionsWithoutAssign:
        'An unconditional eventless transition with no target should contain at least one "assign" action. Without updating the machine context, this transition is guaranteed to create an infinite loop unless a previous transition is taken on the first iteration.',
      unconditionalSelfTransitionIsFirst:
        'The first eventless transition cannot target its own state node unconditionally. This will cause an infinite loop error.',
      unconditionalSelfTransitionNotFirst:
        'Eventless transition cannot not target its own state node unconditionally. This may cause an infinite loop error if no previous transition is taken.',
      noTargetAndGuardNotCheckingContext:
        'The first eventless transition with no target and with a guard not using the machine context is either useless (never taken) or will cause an infinite loop.',
      conditionalSelfTransitionAndGuardNotCheckingContext:
        'An eventless transition targeting itself and with a guard not using the machine context is either useless (never taken) or will cause an infinite loop.',
      noTargetHasGuardNoAssign:
        'A conditional eventless transition with no target and no "assign" action is either useless (never taken) or will cause an infinite loop.',
      conditionalSelfTransitionNoAssign:
        'A conditional eventless transition targeting itself and with no "assign" action is either useless (never taken) or will cause an infinite loop.',
      noTargetNoAssignAndGuardNotCheckingEvent:
        'An eventless transition with no target, with actions not updating the machine context and with a guard not using the event is either useless (never taken) or will cause an infinite loop.',
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
            messageId: 'noTargetNoGuardIsSingle',
          })
        }
      },

      // always: [{}]
      // always: [{ actions: whatever }]
      'Property[key.name="always"] > ArrayExpression > ObjectExpression': function (
        node
      ) {
        if (!isInsideMachineDeclaration(node)) {
          return
        }
        if (!hasProperty('target', node) && !hasProperty('cond', node)) {
          if (isFirstArrayItem(node)) {
            context.report({
              node,
              messageId: 'noTargetNoGuardIsFirst',
            })
            return
          }
          // always: [{ ... }, { actions: assign(...) }]
          // always: [{ ... }, { actions: [assign(...)] }]
          if (hasAssignAction(node)) {
            return
          }

          // if there's at least one action value of string literal/identifier, it
          // may be an assign - we cannot check for this, so we will bail out optimistically
          if (actionsContainStringLiteralOrIdentifier(node)) {
            return
          }

          // completely empty transition,
          // always: [{ ... }, {}]
          if (!hasProperty('actions', node)) {
            context.report({
              node,
              messageId: 'emptyTransitionNotFirst',
            })
            return
          }

          // none of the actions it has is an assign action
          // always: [{ ... }, { actions: () => {} }]
          context.report({
            node,
            messageId: 'unconditionalTransitionNoTargetActionsWithoutAssign',
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
        const targetsItself = isTransitionToItself(node)
        if (!hasProperty('cond', node) && targetsItself) {
          if (isFirstArrayItem(node)) {
            context.report({
              node,
              messageId: 'unconditionalSelfTransitionIsFirst',
            })
            return
          }
          context.report({
            node,
            messageId: 'unconditionalSelfTransitionNotFirst',
          })
          return
        }

        if (
          hasProperty('cond', node) &&
          targetsItself &&
          !hasAssignAction(node) &&
          !actionsContainStringLiteralOrIdentifier(node)
        ) {
          context.report({
            node,
            messageId: 'conditionalSelfTransitionNoAssign',
          })
          return
        }

        if (
          hasProperty('cond', node) &&
          targetsItself &&
          guardIsFunctionAndNotCheckingContext(node)
        ) {
          context.report({
            node,
            messageId: 'conditionalSelfTransitionAndGuardNotCheckingContext',
          })
          return
        }

        // always: [{ cond: something, actions: something }]
        if (
          hasProperty('cond', node) &&
          hasProperty('actions', node) &&
          !hasProperty('target', node)
        ) {
          // If there is no assign action, then the guard is either never taken, or infinite loop.
          // string literal/identifier is optimistically considered an assign action
          if (
            !hasAssignAction(node) &&
            !actionsContainStringLiteralOrIdentifier(node)
          ) {
            context.report({
              node,
              messageId: 'noTargetHasGuardNoAssign',
            })
            return
          }
          // If guard is a function and uses no context - the transition is either never taken,
          // or an infinite loop.
          if (
            isFirstArrayItem(node) &&
            guardIsFunctionAndNotCheckingContext(node)
          ) {
            context.report({
              node,
              messageId: 'noTargetAndGuardNotCheckingContext',
            })
            // return
          }
          // If there is an assign action and guard uses ctx - it may be ok, provided that the guard
          // checks the context value updated by this assign action and there is a false condition
          // reached eventually.
        }
      },
    }
  },
}
