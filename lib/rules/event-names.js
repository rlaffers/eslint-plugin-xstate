'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const words = require('../utils/words')
const isInsideMachineDeclaration = require('../utils/isInsideMachineDeclaration')

const isValidEventName = (string) => /^\*$|^[A-Z_]*$/.test(string)

const macroCase = (string) =>
  words(string.replace(/['\u2019]/g, '')).reduce(
    (result, word, index) => result + (index ? '_' : '') + word.toUpperCase(),
    ''
  )

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'suggest event names in MACRO_CASE',
      category: 'Stylistic Issues',
      url: getDocsUrl('event-names'),
      recommended: 'warn',
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalidEventName:
        'Prefer "{{fixedEventName}}" over "{{eventName}}" event name',
    },
  },

  create: function (context) {
    return {
      'Property[key.name="on"] > ObjectExpression > Property': function (node) {
        // key names [varName] are dynamic values and cannot be linted
        if (node.computed) {
          return
        }
        if (!isInsideMachineDeclaration(node)) {
          return
        }
        const eventName =
          node.key.type === 'Identifier' ? node.key.name : node.key.value
        if (!isValidEventName(eventName)) {
          const fixedEventName = macroCase(eventName)
          context.report({
            node,
            messageId: 'invalidEventName',
            data: { fixedEventName, eventName },
            fix(fixer) {
              return fixer.replaceText(node.key, fixedEventName)
            },
          })
        }
      },
    }
  },
}
