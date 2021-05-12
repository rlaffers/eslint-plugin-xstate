'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  isFunctionExpression,
  isIdentifier,
  isStringLiteral,
  isCallExpression,
  isActionCreatorCall,
  isArrayExpression,
} = require('../utils/predicates')
const { getTypeProperty } = require('../utils/selectors')
const { anyPass } = require('../utils/combinators')

function isArrayWithFunctionExpressionOrIdentifier(node) {
  return (
    node.type === 'ArrayExpression' &&
    node.elements.some(anyPass([isIdentifier, isFunctionExpression]))
  )
}

function isInlineAction(node, allowKnownActionCreators) {
  return (
    isFunctionExpression(node) ||
    isIdentifier(node) ||
    (!allowKnownActionCreators && isCallExpression(node)) ||
    (isCallExpression(node) && !isActionCreatorCall(node))
  )
}

const selectorEventTransitionProperty =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property > ObjectExpression > Property'

const selectorArrayOfEventTransitionsProperty =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property > ArrayExpression > ObjectExpression > Property'

const defaultOptions = {
  allowKnownActionCreators: false,
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest refactoring actions, guards, services, activities into options',
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
      moveServiceToOptions:
        'Move the service implementation into machine options and refer it by its name here.',
    },
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
          messageId: 'moveServiceToOptions',
        })
        return
      }
      if (node.value.type === 'ObjectExpression') {
        const typeProperty = getTypeProperty(node.value)
        if (typeProperty && !isStringLiteral(typeProperty.value)) {
          context.report({
            node: typeProperty,
            messageId: 'moveServiceToOptions',
          })
        }
      }
    }

    function checkTransitionProperty(node) {
      if (
        node.key.name === 'cond' &&
        (isFunctionExpression(node.value) ||
          isIdentifier(node.value) ||
          isCallExpression(node.value))
      ) {
        context.report({
          node,
          messageId: 'moveGuardToOptions',
        })
        return
      }

      if (node.key.name === 'actions') {
        if (isInlineAction(node.value, options.allowKnownActionCreators)) {
          context.report({
            node,
            messageId: 'moveActionToOptions',
          })
        } else if (isArrayExpression(node.value)) {
          node.value.elements.forEach((element) => {
            if (isInlineAction(element, options.allowKnownActionCreators)) {
              context.report({
                node: element,
                messageId: 'moveActionToOptions',
              })
            }
          })
        }
      }
    }

    // TODO detect inline impls inside onDone, onError transitions
    // TODO "on" transitions can have an array syntax
    return {
      [selectorEventTransitionProperty]: checkTransitionProperty,
      [selectorArrayOfEventTransitionsProperty]: checkTransitionProperty,

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="activities"]':
        function (node) {
          if (
            isFunctionExpression(node.value) ||
            isIdentifier(node.value) ||
            isArrayWithFunctionExpressionOrIdentifier(node.value)
          ) {
            context.report({
              node,
              messageId: 'moveActivityToOptions',
            })
          }
        },

      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"] > ObjectExpression > Property[key.name="src"]':
        checkServiceSrc,
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"] > ArrayExpression > ObjectExpression > Property[key.name="src"]':
        checkServiceSrc,
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name=/^entry$|^exit$/]':
        function (node) {
          if (isInlineAction(node.value, options.allowKnownActionCreators)) {
            context.report({
              node,
              messageId: 'moveActionToOptions',
            })
          } else if (isArrayExpression(node.value)) {
            node.value.elements.forEach((element) => {
              if (isInlineAction(element, options.allowKnownActionCreators)) {
                context.report({
                  node: element,
                  messageId: 'moveActionToOptions',
                })
              }
            })
          }
        },
    }
  },
}
