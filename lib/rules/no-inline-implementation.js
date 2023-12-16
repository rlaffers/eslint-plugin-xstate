'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  isFunctionExpression,
  isIdentifier,
  isStringLiteral,
  isCallExpression,
  isKnownActionCreatorCall,
  isArrayExpression,
} = require('../utils/predicates')
const { getTypeProperty } = require('../utils/selectors')
const { anyPass } = require('../utils/combinators')
const getSettings = require('../utils/getSettings')
const XStateDetector = require('../utils/XStateDetector')
const isSpawnFromParametersCallExpresion = require('../utils/isSpawnFromParametersCallExpression')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

function isArrayWithFunctionExpressionOrIdentifier(node) {
  return (
    node.type === 'ArrayExpression' &&
    node.elements.some(anyPass([isIdentifier, isFunctionExpression]))
  )
}

function isInlineAction(
  node,
  allowKnownActionCreators,
  actionCreatorRegex,
  version
) {
  return (
    isFunctionExpression(node) ||
    isIdentifier(node) ||
    (isCallExpression(node) &&
      !(
        (allowKnownActionCreators && isKnownActionCreatorCall(node, version)) ||
        isValidCallExpression(node, actionCreatorRegex)
      ))
  )
}

function isValidCallExpression(node, pattern = '') {
  if (pattern === '' || node.callee.type !== 'Identifier') {
    return false
  }
  return new RegExp(pattern).test(node.callee.name)
}

// states: { idle: { on: { EVENT: { target: 'active' }}}}
const propertyOfEventTransition = (prefix) =>
  `${prefix}Property[key.name="on"] > ObjectExpression > Property > ObjectExpression > Property`

// states: { idle: { on: { EVENT: [{ target: 'active' }]}}}
const propertyOfEventTransitionInArray = (prefix) =>
  `${prefix}Property[key.name="on"] > ObjectExpression > Property > ArrayExpression > ObjectExpression > Property`

// states: { idle: { on: [ { event: 'EVENT', target: 'active' } ]}}
const propertyOfAltEventTransitionInArray = (prefix) =>
  `${prefix}Property[key.name="on"] > ArrayExpression > ObjectExpression > Property`

const srcPropertyInsideInvoke = (prefix) =>
  `${prefix}Property[key.name="invoke"] > ObjectExpression > Property[key.name="src"]`

const srcPropertyInsideInvokeArray = (prefix) =>
  `${prefix}Property[key.name="invoke"] > ArrayExpression > ObjectExpression > Property[key.name="src"]`

const entryExitProperty = (prefix) =>
  `${prefix}Property[key.name=/^entry$|^exit$/]`

// invoke: { onDone: { target: 'active' }}
const propertyOfOnDoneOnErrorTransition = (prefix) =>
  `${prefix}Property[key.name=/^onDone$|^onError$/] > ObjectExpression > Property`

// invoke: { onDone: [{ target: 'active' }] }
const propertyOfOnDoneOnErrorTransitionInArray = (prefix) =>
  `${prefix}Property[key.name=/^onDone$|^onError$/] > ArrayExpression > ObjectExpression > Property`

const activitiesProperty = (prefix) =>
  `${prefix}Property[key.name="activities"]`

const propertyOfChoosableActionObject = (prefix) =>
  prefix === ''
    ? 'CallExpression[callee.name="choose"] > ArrayExpression > ObjectExpression > Property'
    : `${prefix}> ObjectExpression:first-child CallExpression[callee.name="choose"] > ArrayExpression > ObjectExpression > Property`

const propertyOfChoosableActionObjectAlt = (prefix) =>
  prefix === ''
    ? 'CallExpression[callee.type="MemberExpression"][callee.object.name="actions"][callee.property.name="choose"] > ArrayExpression > ObjectExpression > Property'
    : `${prefix}> ObjectExpression:first-child CallExpression[callee.type="MemberExpression"][callee.object.name="actions"][callee.property.name="choose"] > ArrayExpression > ObjectExpression > Property`

const defaultOptions = {
  allowKnownActionCreators: false,
  actionCreatorRegex: '',
  guardCreatorRegex: '',
  actorCreatorRegex: '',
}

const guardPropName = {
  4: 'cond',
  5: 'guard',
}

const knownGuards = ['and', 'or', 'not', 'stateIn']

function isKnownGuard(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    knownGuards.includes(node.callee.name)
  )
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest refactoring actions, guards, actors, activities into options',
      category: 'Best Practices',
      url: getDocsUrl('no-inline-implementation'),
      recommended: 'warn',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowKnownActionCreators: {
            type: 'boolean',
            default: defaultOptions.allowKnownActionCreators,
          },
          actionCreatorRegex: {
            type: 'string',
            format: 'regex',
            default: defaultOptions.actionCreatorRegex,
          },
          guardCreatorRegex: {
            type: 'string',
            format: 'regex',
            default: defaultOptions.guardCreatorRegex,
          },
          actorCreatorRegex: {
            type: 'string',
            format: 'regex',
            default: defaultOptions.actorCreatorRegex,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      moveGuardToOptions:
        'Move the guard implementation into machine options and refer it by its name here.',
      moveActionToOptions:
        'Move the action implementation into machine options and refer it by its name here.',
      moveActivityToOptions:
        'Move the activity implementation into machine options and refer it by its name here.',
      moveActorToOptions:
        'Move the actor implementation into machine options and refer it by its name here.',
    },
  },

  create: function (context) {
    const prefix = getSelectorPrefix(context.sourceCode)
    const { version } = getSettings(context)
    const options = context.options[0] || defaultOptions

    const xstateDetector = new XStateDetector()

    function checkActorSrc(node) {
      if (isStringLiteral(node.value)) {
        return
      }
      if (
        isCallExpression(node.value) &&
        isValidCallExpression(node.value, options.actorCreatorRegex)
      ) {
        return
      }
      if (node.value.type === 'ObjectExpression') {
        const typeProperty = getTypeProperty(node.value)
        if (typeProperty && !isStringLiteral(typeProperty.value)) {
          context.report({
            node: typeProperty,
            messageId: 'moveActorToOptions',
          })
        }
      }

      context.report({
        node,
        messageId: 'moveActorToOptions',
      })
    }

    function checkTransitionProperty(node) {
      if (node.key.name === guardPropName[version]) {
        if (isStringLiteral(node.value)) {
          return
        }
        if (
          version >= 5 &&
          isCallExpression(node.value) &&
          isKnownGuard(node.value)
        ) {
          return
        }
        if (
          isCallExpression(node.value) &&
          isValidCallExpression(node.value, options.guardCreatorRegex)
        ) {
          return
        }
        context.report({
          node,
          messageId: 'moveGuardToOptions',
        })
        return
      }

      if (node.key.name === 'actions') {
        if (
          isInlineAction(
            node.value,
            options.allowKnownActionCreators,
            options.actionCreatorRegex,
            version
          )
        ) {
          context.report({
            node,
            messageId: 'moveActionToOptions',
          })
          return
        }
        if (isArrayExpression(node.value)) {
          node.value.elements.forEach((element) => {
            if (
              isInlineAction(
                element,
                options.allowKnownActionCreators,
                options.actionCreatorRegex,
                version
              )
            ) {
              context.report({
                node: element,
                messageId: 'moveActionToOptions',
              })
            }
          })
        }
      }
    }

    const spawnCall = (prefix) =>
      prefix === ''
        ? 'CallExpression'
        : `${prefix}> ObjectExpression:first-child CallExpression`

    return {
      ...(version === 4 ? xstateDetector.visitors : {}),
      [propertyOfEventTransition(prefix)]: checkTransitionProperty,
      [propertyOfEventTransitionInArray(prefix)]: checkTransitionProperty,
      [propertyOfAltEventTransitionInArray(prefix)]: checkTransitionProperty,
      [propertyOfOnDoneOnErrorTransition(prefix)]: checkTransitionProperty,
      [propertyOfOnDoneOnErrorTransitionInArray(prefix)]:
        checkTransitionProperty,
      [propertyOfChoosableActionObject(prefix)]: checkTransitionProperty,
      [propertyOfChoosableActionObjectAlt(prefix)]: checkTransitionProperty,

      [activitiesProperty(prefix)]: function (node) {
        if (
          isFunctionExpression(node.value) ||
          isIdentifier(node.value) ||
          isArrayWithFunctionExpressionOrIdentifier(node.value) ||
          (isCallExpression(node.value) &&
            !isValidCallExpression(node.value, options.actorCreatorRegex))
        ) {
          context.report({
            node,
            messageId: 'moveActivityToOptions',
          })
        }
      },

      [srcPropertyInsideInvoke(prefix)]: checkActorSrc,

      [srcPropertyInsideInvokeArray(prefix)]: checkActorSrc,

      [entryExitProperty(prefix)]: function (node) {
        if (
          isInlineAction(
            node.value,
            options.allowKnownActionCreators,
            options.actionCreatorRegex,
            version
          )
        ) {
          context.report({
            node,
            messageId: 'moveActionToOptions',
          })
        } else if (isArrayExpression(node.value)) {
          node.value.elements.forEach((element) => {
            if (
              isInlineAction(
                element,
                options.allowKnownActionCreators,
                options.actionCreatorRegex,
                version
              )
            ) {
              context.report({
                node: element,
                messageId: 'moveActionToOptions',
              })
            }
          })
        }
      },

      [spawnCall(prefix)]: function (node) {
        if (version === 4) {
          if (
            xstateDetector.isSpawnCallExpression(node) &&
            node.arguments[0] &&
            !isStringLiteral(node.arguments[0])
          ) {
            context.report({
              node: node.arguments[0],
              messageId: 'moveActorToOptions',
            })
          }
          return
        }

        // In XState v5, spawn comes from arguments passed to the callback within assign()
        if (!isSpawnFromParametersCallExpresion(node)) {
          return
        }

        if (node.arguments[0] && !isStringLiteral(node.arguments[0])) {
          context.report({
            node: node.arguments[0],
            messageId: 'moveActorToOptions',
          })
        }
      },
    }
  },
}
