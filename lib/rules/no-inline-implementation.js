'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const isInsideMachineDeclaration = require('../utils/isInsideMachineDeclaration')
const {
  isFunctionExpression,
  isIdentifier,
  isStringLiteral,
} = require('../utils/predicates')
const { getTypeProperty } = require('../utils/selectors')
const { anyPass } = require('../utils/combinators')

function isArrayWithFunctionExpressionOrIdentifier(node) {
  return (
    node.type === 'ArrayExpression' &&
    node.elements.some(anyPass([isIdentifier, isFunctionExpression]))
  )
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
    schema: [],
    messages: {
      moveGuardToOptions:
        'Move guard implementation into machine options and refer it by its name here.',
      moveActionsToOptions:
        'Move actions implementation into machine options and refer it by its name here.',
      moveActivitiesToOptions:
        'Move activities implementation into machine options and refer it by its name here.',
      moveServiceToOptions:
        'Move service implementation into machine options and refer it by its name here.',
    },
  },

  create: function (context) {
    return {
      'Property[key.name="on"] > ObjectExpression > Property > ObjectExpression > Property': function (
        node
      ) {
        if (!isInsideMachineDeclaration(node)) {
          return
        }
        if (
          node.key.name === 'cond' &&
          (isFunctionExpression(node.value) || isIdentifier(node.value))
        ) {
          context.report({
            node,
            messageId: 'moveGuardToOptions',
          })
          return
        }
        if (
          node.key.name === 'actions' &&
          (isFunctionExpression(node.value) ||
            isIdentifier(node.value) ||
            isArrayWithFunctionExpressionOrIdentifier(node.value))
        ) {
          context.report({
            node,
            messageId: 'moveActionsToOptions',
          })
          return
        }
        if (
          node.key.name === 'activities' &&
          (isFunctionExpression(node.value) ||
            isIdentifier(node.value) ||
            isArrayWithFunctionExpressionOrIdentifier(node.value))
        ) {
          context.report({
            node,
            messageId: 'moveActivitiesToOptions',
          })
        }
      },

      'Property[key.name="invoke"] > ObjectExpression > Property[key.name="src"]': function (
        node
      ) {
        if (!isInsideMachineDeclaration(node)) {
          return
        }
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
      },
      'Property[key.name=/^entry$|^exit$/]': function (node) {
        if (!isInsideMachineDeclaration(node)) {
          return
        }

        if (
          isFunctionExpression(node.value) ||
          isIdentifier(node.value) ||
          isArrayWithFunctionExpressionOrIdentifier(node.value)
        ) {
          context.report({
            node,
            messageId: 'moveActionsToOptions',
          })
        }
      },
    }
  },
}
