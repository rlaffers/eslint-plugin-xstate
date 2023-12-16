'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')
const getSelectorPrefix = require('../utils/getSelectorPrefix')
const {
  isAssignActionCreatorCall,
  isWithinNode,
  isFunctionExpression,
} = require('../utils/predicates')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce using systemId on invoke',
      category: 'Best Practices',
      url: getDocsUrl('enforce-system-id'),
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingSystemId: 'Missing "systemId" property for an invoked actor.',
      missingSystemIdSpawn: 'Missing "systemId" property for a spawned actor.',
      invalidSystemId: 'Property "systemId" should be a non-empty string.',
      systemIdNotAllowedBeforeVersion5:
        'Property "systemId" is not supported in xstate < 5.',
      duplicateSystemId: 'The systemId "{{systemId}}" is not unique.',
    },
  },

  create(context) {
    const { version } = getSettings(context)
    const prefix = getSelectorPrefix(context.sourceCode)
    const systemIds = new Set()

    function checkSpawnExpression(node) {
      // check if this spawn call is relevant - must be within a function expression inside the assign action creator
      if (
        !isWithinNode(
          node,
          (ancestor) =>
            isFunctionExpression(ancestor) &&
            isWithinNode(
              ancestor,
              (x) => isAssignActionCreatorCall(x),
              (ancestor) => isFunctionExpression(ancestor)
            )
        )
      ) {
        return
      }

      if (node.arguments.length < 2) {
        context.report({
          node,
          messageId: 'missingSystemIdSpawn',
        })
        return
      }
      const arg2 = node.arguments[1]
      if (
        arg2.type !== 'ObjectExpression' ||
        !arg2.properties.some((prop) => prop.key.name === 'systemId')
      ) {
        context.report({
          node: arg2,
          messageId: 'missingSystemIdSpawn',
        })
        return
      }
      const systemIdProp = arg2.properties.find(
        (prop) => prop.key.name === 'systemId'
      )

      if (
        systemIdProp.value.type !== 'Literal' ||
        typeof systemIdProp.value.value !== 'string' ||
        systemIdProp.value.value.trim() === ''
      ) {
        context.report({
          node: systemIdProp,
          messageId: 'invalidSystemId',
        })
      }
    }

    function checkUniqueSystemId(node) {
      if (systemIds.has(node.value.value)) {
        context.report({
          node,
          messageId: 'duplicateSystemId',
          data: { systemId: node.value.value },
        })
      } else {
        systemIds.add(node.value.value)
      }
    }

    return {
      [`${prefix}Property[key.name='invoke'] > ObjectExpression`]: (node) => {
        const systemIdProp = node.properties.find(
          (property) => property.key.name === 'systemId'
        )
        if (systemIdProp) {
          if (version < 5) {
            context.report({
              node: systemIdProp,
              messageId: 'systemIdNotAllowedBeforeVersion5',
              fix(fixer) {
                const nextToken = context.sourceCode.getTokenAfter(systemIdProp)
                if (
                  nextToken.type === 'Punctuator' &&
                  nextToken.value === ','
                ) {
                  return fixer.removeRange([
                    systemIdProp.range[0],
                    nextToken.range[1],
                  ])
                }
                return fixer.remove(systemIdProp)
              },
            })
          } else if (
            systemIdProp.value.type !== 'Literal' ||
            typeof systemIdProp.value.value !== 'string' ||
            systemIdProp.value.value.trim() === ''
          ) {
            context.report({
              node: systemIdProp,
              messageId: 'invalidSystemId',
            })
          }
        } else if (version >= 5) {
          context.report({
            node,
            messageId: 'missingSystemId',
          })
        }
      },

      [`${prefix}Property[key.name='invoke'] > ObjectExpression > Property[key.name="systemId"]`]:
        checkUniqueSystemId,
      [`${prefix}CallExpression[callee.name="assign"] CallExpression[callee.name="spawn"] > ObjectExpression > Property[key.name="systemId"]`]:
        checkUniqueSystemId,

      [`${prefix} CallExpression[callee.name="spawn"]`]: checkSpawnExpression,
      [`${prefix} CallExpression[callee.property.name="spawn"]`]:
        checkSpawnExpression,
    }
  },
}
