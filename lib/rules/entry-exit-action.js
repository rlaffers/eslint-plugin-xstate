'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  hasProperty,
  isStringLiteralOrIdentifier,
  isFunctionExpression,
  isCallExpression,
} = require('../utils/predicates')
const getSelectorPrefix = require('../utils/getSelectorPrefix')
const getSettings = require('../utils/getSettings')

function isObjectWithGuard(node, version) {
  return (
    node.type === 'ObjectExpression' &&
    hasProperty(version > 4 ? 'guard' : 'cond', node)
  )
}

function isValidAction(node) {
  return (
    isStringLiteralOrIdentifier(node) ||
    isFunctionExpression(node) ||
    isCallExpression(node) ||
    (node.type === 'ObjectExpression' && hasProperty('type', node))
  )
}

const entryActionDeclaration = (prefix) =>
  prefix === ''
    ? 'Property[key.name!="states"] > ObjectExpression > Property[key.name="entry"]'
    : `${prefix}Property[key.name!="states"] > ObjectExpression > Property[key.name="entry"]`

const rootEntryActionDeclaration = (prefix) =>
  prefix === ''
    ? 'Property[key.name="entry"]'
    : `${prefix}> ObjectExpression:nth-child(1) > Property[key.name="entry"]`

const exitActionDeclaration = (prefix) =>
  prefix === ''
    ? 'Property[key.name!="states"] > ObjectExpression > Property[key.name="exit"]'
    : `${prefix}Property[key.name!="states"] > ObjectExpression > Property[key.name="exit"]`

const rootExitActionDeclaration = (prefix) =>
  prefix === ''
    ? 'Property[key.name="exit"]'
    : `${prefix}> ObjectExpression:nth-child(1) > Property[key.name="exit"]`

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
        'Invalid declaration of an "exit" action. Use the "choose" or "pure" action creators to specify a conditional exit action.',
      invalidEntryAction:
        'The "entry" action has an invalid value. Specify a function, string, variable, action creator call, action object, or an array of those.',
      invalidExitAction:
        'The "exit" action has an invalid value. Specify a function, string, variable, action creator call, action object, or an array of those.',
    },
  },

  create: function (context) {
    const { version } = getSettings(context)
    const prefix = getSelectorPrefix(context.sourceCode)
    const validateAction = (actionType) => (node) => {
      if (isObjectWithGuard(node.value, version)) {
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
          if (isObjectWithGuard(element, version)) {
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
      [entryActionDeclaration(prefix)]: validateAction('entry'),
      [rootEntryActionDeclaration(prefix)]: validateAction('entry'),
      [exitActionDeclaration(prefix)]: validateAction('exit'),
      [rootExitActionDeclaration(prefix)]: validateAction('exit'),
    }
  },
}
