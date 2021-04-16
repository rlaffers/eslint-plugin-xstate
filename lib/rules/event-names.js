'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const words = require('../utils/words')
const isInsideMachineDeclaration = require('../utils/isInsideMachineDeclaration')
const { isStringLiteral, getTypeProperty } = require('../utils/commonMatchers')

const isValidEventName = (string) => /^\*$|^[A-Z0-9_]*$/.test(string)

const macroCase = (string) =>
  words(string.replace(/['\u2019]/g, '')).reduce(
    (result, word, index) => result + (index ? '_' : '') + word.toUpperCase(),
    ''
  )
const selectorSendEvent =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] CallExpression[callee.name=/^send$|^sendParent$|^respond$|^raise$/]'

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
      // TODO event objects
      [selectorSendEvent]: function (node) {
        const eventArg = node.arguments[0]
        if (!eventArg) {
          return
        }
        if (isStringLiteral(eventArg) && !isValidEventName(eventArg.value)) {
          const eventName = eventArg.value
          const fixedEventName = macroCase(eventName)
          const quote = eventArg.raw[0]
          context.report({
            node,
            messageId: 'invalidEventName',
            data: { fixedEventName, eventName },
            fix(fixer) {
              return fixer.replaceText(
                eventArg,
                `${quote}${fixedEventName}${quote}`
              )
            },
          })
          return
        }

        if (eventArg.type === 'ObjectExpression') {
          const type = getTypeProperty(eventArg)
          if (
            type &&
            isStringLiteral(type.value) &&
            !isValidEventName(type.value.value)
          ) {
            const eventName = type.value.value
            const fixedEventName = macroCase(eventName)
            const quote = type.value.raw[0]
            context.report({
              node,
              messageId: 'invalidEventName',
              data: { fixedEventName, eventName },
              fix(fixer) {
                return fixer.replaceText(
                  type.value,
                  `${quote}${fixedEventName}${quote}`
                )
              },
            })
          }
        }
      },
    }
  },
}
