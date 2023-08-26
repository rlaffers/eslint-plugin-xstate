'use strict'

const snakeCase = require('lodash.snakecase')
const camelCase = require('lodash.camelcase')
const getDocsUrl = require('../utils/getDocsUrl')
const { isStringLiteral } = require('../utils/predicates')
const { getTypeProperty } = require('../utils/selectors')
const { init, last } = require('../utils/arrays')
const getSelectorPrefix = require('../utils/getSelectorPrefix')

const toMacroCase = (string) => {
  const words = string.split('.').filter(Boolean)
  if (last(words) === '*') {
    return [...init(words).map(snakeCase), '*'].join('.').toUpperCase()
  }
  return words.map(snakeCase).join('.').toUpperCase()
}

const toSnakeCase = (string) => {
  const words = string.split('.').filter(Boolean)
  if (last(words) === '*') {
    return [...init(words).map(snakeCase), '*'].join('.')
  }
  return words.map(snakeCase).join('.')
}

const toCamelCase = (string) => {
  const words = string.split('.').filter(Boolean)
  if (last(words) === '*') {
    return [...init(words).map(camelCase), '*'].join('.')
  }
  return words.map(camelCase).join('.')
}

function fixEventName(name, mode) {
  switch (mode) {
    case 'macroCase':
      return toMacroCase(name)

    case 'snakeCase':
      return toSnakeCase(name)

    case 'camelCase':
      return toCamelCase(name)

    default:
      return name
  }
}

function containsWildcard(name) {
  return name.includes('*')
}

function isPropertyOfStateNode(property) {
  const grandParent = property.parent.parent.parent.parent
  return grandParent.type === 'Property' && grandParent.key.name === 'states'
}

const wildcardOrDot = /[.*]/
function containsWildcardOrDot(name) {
  return wildcardOrDot.test(name)
}

const selectorSendEvent = (prefix) =>
  prefix === ''
    ? 'CallExpression[callee.name=/^send$|^sendTo$|^sendParent$|^respond$|^raise$|^forwardTo$/]'
    : `${prefix}CallExpression[callee.name=/^send$|^sendTo$|^sendParent$|^respond$|^raise$|^forwardTo$/]`

/**
 * Default regular expression for the regex option.
 * @type {string}
 */
const defaultRegex = '^[a-z]*$'

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'suggest consistent formatting of event names',
      category: 'Stylistic Issues',
      url: getDocsUrl('event-names'),
      recommended: 'warn',
    },
    fixable: 'code',
    schema: [
      {
        enum: ['macroCase', 'camelCase', 'snakeCase', 'regex'],
      },
      {
        type: 'object',
        properties: {
          regex: {
            type: 'string',
            format: 'regex',
            default: defaultRegex,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidEventName:
        'Prefer "{{fixedEventName}}" over "{{eventName}}" event name',
      invalidSendEventName:
        'Wildcards in event names cannot be used when sending events.',
      eventNameViolatesRegex:
        'Event name "{{eventName}}" violates regular expression /{{regex}}/',
    },
  },

  create: function (context) {
    const prefix = getSelectorPrefix(context.sourceCode)
    const mode = context.options[0] || 'macroCase'
    const regexOption =
      mode === 'regex'
        ? (context.options[1] && context.options[1].regex) || defaultRegex
        : null
    const regex = regexOption !== null ? new RegExp(regexOption) : null

    return {
      [`${prefix}Property[key.name="on"] > ObjectExpression > Property`]:
        function (node) {
          // key names [varName] are dynamic values and cannot be linted
          if (node.computed) {
            return
          }
          // make sure this is not a property of a "on" state node
          if (isPropertyOfStateNode(node)) {
            return
          }

          const eventName =
            node.key.type === 'Identifier' ? node.key.name : node.key.value

          if (regex && !regex.test(eventName)) {
            context.report({
              node,
              data: { eventName, regex: regexOption },
              messageId: 'eventNameViolatesRegex',
            })
            return
          }

          const fixedEventName = fixEventName(eventName, mode)
          // quotes are needed only if the event name contains "." or "*"
          const quote = containsWildcardOrDot(eventName) ? "'" : ''
          if (eventName !== fixedEventName) {
            context.report({
              node,
              messageId: 'invalidEventName',
              data: { fixedEventName, eventName },
              fix(fixer) {
                return fixer.replaceText(
                  node.key,
                  `${quote}${fixedEventName}${quote}`
                )
              },
            })
          }
        },

      [selectorSendEvent(prefix)]: function (node) {
        const eventArg = node.arguments[0]
        if (!eventArg) {
          return
        }
        if (isStringLiteral(eventArg)) {
          const eventName = eventArg.value
          if (containsWildcard(eventName)) {
            context.report({
              node,
              messageId: 'invalidSendEventName',
            })
            return
          }

          if (regex && !regex.test(eventName)) {
            context.report({
              node,
              data: { eventName, regex: regexOption },
              messageId: 'eventNameViolatesRegex',
            })
            return
          }

          const fixedEventName = fixEventName(eventName, mode)
          if (eventName !== fixedEventName) {
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
          }
          return
        }

        if (eventArg.type === 'ObjectExpression') {
          const type = getTypeProperty(eventArg)
          if (type && isStringLiteral(type.value)) {
            const eventName = type.value.value
            if (containsWildcard(eventName)) {
              context.report({
                node,
                messageId: 'invalidSendEventName',
              })
              return
            }

            if (regex && !regex.test(eventName)) {
              context.report({
                node,
                data: { eventName, regex: regexOption },
                messageId: 'eventNameViolatesRegex',
              })
              return
            }

            const fixedEventName = fixEventName(eventName, mode)
            if (eventName !== fixedEventName) {
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
        }
      },
    }
  },
}
