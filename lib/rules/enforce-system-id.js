'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const getSettings = require('../utils/getSettings')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

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
      missingSystemId: 'Missing "systemId" property in "invoke" block.',
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
              fix: (fixer) =>
                fixer.replaceText(systemIdProp.value, "'myActor'"),
            })
          }
        } else if (version >= 5) {
          const { loc } = node.properties[0]
          const offset = loc.start.column
          context.report({
            node,
            messageId: 'missingSystemId',
            fix: (fixer) => {
              return fixer.insertTextBefore(
                node.properties[0],
                `systemId: 'myActor',\n${''.padStart(offset, ' ')}`
              )
            },
          })
        }
      },

      [`${prefix}Property[key.name='invoke'] > ObjectExpression > Property[key.name="systemId"]`]:
        (node) => {
          if (systemIds.has(node.value.value)) {
            context.report({
              node,
              messageId: 'duplicateSystemId',
              data: { systemId: node.value.value },
            })
          } else {
            systemIds.add(node.value.value)
          }
        },

      // TODO check use of systemId in spawns
    }
  },
}
