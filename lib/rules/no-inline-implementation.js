'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  isFunctionExpression,
  isIdentifier,
  isStringLiteral,
  isCallExpression,
  isKnownActionCreatorCall,
  isArrayExpression
} = require('../utils/predicates')
const { getTypeProperty } = require('../utils/selectors')
const { anyPass } = require('../utils/combinators')

function isArrayWithFunctionExpressionOrIdentifier(node) {
  return (
    node.type === 'ArrayExpression' &&
    node.elements.some(anyPass([isIdentifier, isFunctionExpression]))
  )
}

function isInlineAction(node, allowKnownActionCreators, actionCreatorRegex) {
  return (
    isFunctionExpression(node) ||
    isIdentifier(node) ||
    (isCallExpression(node) &&
      !(
        (allowKnownActionCreators && isKnownActionCreatorCall(node)) ||
        isValidCallExpression(node, actionCreatorRegex)
      ))
  )
}

function isValidCallExpression(node, pattern = '') {
  if (pattern === '') {
    return false
  }
  return new RegExp(pattern).test(node.callee.name)
}

// states: { idle: { on: { EVENT: { target: 'active' }}}}
const propertyOfEventTransition =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property > ObjectExpression > Property'

// states: { idle: { on: { EVENT: [{ target: 'active' }]}}}
const propertyOfEventTransitionInArray =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property > ArrayExpression > ObjectExpression > Property'

// states: { idle: { on: [ { event: 'EVENT', target: 'active' } ]}}
const propertyOfAltEventTransitionInArray =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ArrayExpression > ObjectExpression > Property'

const srcPropertyInsideInvoke =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"] > ObjectExpression > Property[key.name="src"]'

const srcPropertyInsideInvokeArray =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"] > ArrayExpression > ObjectExpression > Property[key.name="src"]'

const entryExitProperty =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^entry$|^exit$/]'

// invoke: { onDone: { target: 'active' }}
const propertyOfOnDoneOnErrorTransition =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^onDone$|^onError$/] > ObjectExpression > Property'

// invoke: { onDone: [{ target: 'active' }] }
const propertyOfOnDoneOnErrorTransitionInArray =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^onDone$|^onError$/] > ArrayExpression > ObjectExpression > Property'

const activitiesProperty =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="activities"]'

const propertyOfChoosableActionObject =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.name="choose"] > ArrayExpression > ObjectExpression > Property'

const propertyOfChoosableActionObjectAlt =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.type="MemberExpression"][callee.object.name="actions"][callee.property.name="choose"] > ArrayExpression > ObjectExpression > Property'

const defaultOptions = {
  allowKnownActionCreators: false,
  actionCreatorRegex: '',
  guardCreatorRegex: '',
  serviceCreatorRegex: ''
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest refactoring actions, guards, services, activities into options',
      category: 'Best Practices',
      url: getDocsUrl('no-inline-implementation'),
      recommended: 'warn'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowKnownActionCreators: {
            type: 'boolean',
            default: defaultOptions.allowKnownActionCreators
          },
          actionCreatorRegex: {
            type: 'string',
            format: 'regex',
            default: defaultOptions.actionCreatorRegex
          },
          guardCreatorRegex: {
            type: 'string',
            format: 'regex',
            default: defaultOptions.guardCreatorRegex
          },
          serviceCreatorRegex: {
            type: 'string',
            format: 'regex',
            default: defaultOptions.serviceCreatorRegex
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      moveGuardToOptions:
        'Move the guard implementation into machine options and refer it by its name here.',
      moveActionToOptions:
        'Move the action implementation into machine options and refer it by its name here.',
      moveActivityToOptions:
        'Move the activity implementation into machine options and refer it by its name here.',
      moveServiceToOptions:
        'Move the service implementation into machine options and refer it by its name here.'
    }
  },

  create: function (context) {
    const options = context.options[0] || defaultOptions
    function checkServiceSrc(node) {
      if (
        !isStringLiteral(node.value) &&
        node.value.type !== 'ObjectExpression'
      ) {
        context.report({
          node,
          messageId: 'moveServiceToOptions'
        })
        return
      }
      if (node.value.type === 'ObjectExpression') {
        const typeProperty = getTypeProperty(node.value)
        if (typeProperty && !isStringLiteral(typeProperty.value)) {
          context.report({
            node: typeProperty,
            messageId: 'moveServiceToOptions'
          })
        }
      }
    }

    function checkTransitionProperty(node) {
      if (node.key.name === 'cond') {
        if (
          isFunctionExpression(node.value) ||
          isIdentifier(node.value) ||
          (isCallExpression(node.value) &&
            !isValidCallExpression(node.value, options.guardCreatorRegex))
        ) {
          context.report({
            node,
            messageId: 'moveGuardToOptions'
          })
          return
        }
      }

      if (node.key.name === 'actions') {
        if (
          isInlineAction(
            node.value,
            options.allowKnownActionCreators,
            options.actionCreatorRegex
          )
        ) {
          context.report({
            node,
            messageId: 'moveActionToOptions'
          })
        } else if (isArrayExpression(node.value)) {
          node.value.elements.forEach(element => {
            if (
              isInlineAction(
                element,
                options.allowKnownActionCreators,
                options.actionCreatorRegex
              )
            ) {
              context.report({
                node: element,
                messageId: 'moveActionToOptions'
              })
            }
          })
        }
      }
    }

    return {
      [propertyOfEventTransition]: checkTransitionProperty,
      [propertyOfEventTransitionInArray]: checkTransitionProperty,
      [propertyOfAltEventTransitionInArray]: checkTransitionProperty,
      [propertyOfOnDoneOnErrorTransition]: checkTransitionProperty,
      [propertyOfOnDoneOnErrorTransitionInArray]: checkTransitionProperty,
      [propertyOfChoosableActionObject]: checkTransitionProperty,
      [propertyOfChoosableActionObjectAlt]: checkTransitionProperty,

      [activitiesProperty]: function (node) {
        if (
          isFunctionExpression(node.value) ||
          isIdentifier(node.value) ||
          isArrayWithFunctionExpressionOrIdentifier(node.value)
        ) {
          context.report({
            node,
            messageId: 'moveActivityToOptions'
          })
        }
      },

      [srcPropertyInsideInvoke]: checkServiceSrc,

      [srcPropertyInsideInvokeArray]: checkServiceSrc,

      [entryExitProperty]: function (node) {
        if (isInlineAction(node.value, options.allowKnownActionCreators)) {
          context.report({
            node,
            messageId: 'moveActionToOptions'
          })
        } else if (isArrayExpression(node.value)) {
          node.value.elements.forEach(element => {
            if (isInlineAction(element, options.allowKnownActionCreators)) {
              context.report({
                node: element,
                messageId: 'moveActionToOptions'
              })
            }
          })
        }
      }
    }
  }
}
