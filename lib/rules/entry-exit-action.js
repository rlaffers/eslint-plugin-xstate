'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  hasProperty,
  isStringLiteralOrIdentifier,
  isFunctionExpression,
  isCallExpression,
} = require('../utils/predicates')

function isObjectWithGuard(node) {
  return node.type === 'ObjectExpression' && hasProperty('cond', node)
}

function isValidAction(node) {
  return (
    isStringLiteralOrIdentifier(node) ||
    isFunctionExpression(node) ||
    isCallExpression(node) ||
    (node.type === 'ObjectExpression' && hasProperty('type', node))
  )
}

const entryActionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name!="states"] > ObjectExpression > Property[key.name="entry"]'

const rootEntryActionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:nth-child(1) > Property[key.name="entry"]'

const exitActionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name!="states"] > ObjectExpression > Property[key.name="exit"]'

const rootExitActionDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] > ObjectExpression:nth-child(1) > Property[key.name="exit"]'

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'enforce usage of choose or pure action creator for guarded entry/exit actions',
      category: 'Possible Errors',
      url: getDocsUrl('conditional-entry-exit'),
      recommended: true,
    },
    schema: [],
    messages: {
      invalidGuardedEntryAction:
        'Invalid declaration of an "entry" action. Use the "choose" or "pure" action creators to specify a conditional entry action.',
      invalidGuardedExitAction:
        'Invalid declaration of an "entry" action. Use the "choose" or "pure" action creators to specify a conditional entry action.',
      invalidEntryAction:
        'The "entry" action has an invalid value. Specify a function, string, variable, action creator call, action object, or an array of those.',
      invalidExitAction:
        'The "exit" action has an invalid value. Specify a function, string, variable, action creator call, action object, or an array of those.',
    },
  },

  create: function (context) {
    const validateAction = (actionType) => (node) => {
      if (isObjectWithGuard(node.value)) {
        context.report({
          node,
          messageId:
            actionType === 'entry'
              ? 'invalidGuardedEntryAction'
              : 'invalidGuardedExitAction',
        })
        return
      }

      if (node.value.type !== 'ArrayExpression' && !isValidAction(node.value)) {
        context.report({
          node,
          messageId:
            actionType === 'entry' ? 'invalidEntryAction' : 'invalidExitAction',
        })
        return
      }

      if (node.value.type === 'ArrayExpression') {
        node.value.elements.forEach((element) => {
          if (isObjectWithGuard(element)) {
            context.report({
              node: element,
              messageId:
                actionType === 'entry'
                  ? 'invalidGuardedEntryAction'
                  : 'invalidGuardedExitAction',
            })
          } else if (!isValidAction(element)) {
            context.report({
              node: element,
              messageId:
                actionType === 'entry'
                  ? 'invalidEntryAction'
                  : 'invalidExitAction',
            })
          }
        })
      }
    }
    return {
      [entryActionDeclaration]: validateAction('entry'),
      [rootEntryActionDeclaration]: validateAction('entry'),
      [exitActionDeclaration]: validateAction('exit'),
      [rootExitActionDeclaration]: validateAction('exit'),
    }
  },
}
