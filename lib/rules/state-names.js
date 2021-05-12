'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isReservedXStateWord } = require('../utils/predicates')
const snakeCase = require('lodash.snakecase')
const camelCase = require('lodash.camelcase')
const upperFirst = require('lodash.upperfirst')

function fixName(name, mode) {
  switch (mode) {
    case 'snakeCase':
      return snakeCase(name)

    case 'camelCase':
      return camelCase(name)

    case 'pascalCase':
      return upperFirst(camelCase(name))

    default:
      return name
  }
}

const identifierRegex = /^[a-zA-Z0-9_$]*$/
function mustBeQuoted(string) {
  return !identifierRegex.test(string)
}

/**
 * Default regular expression for the regex option.
 * @type {string}
 */
const defaultRegex = '^[a-z]*$'

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'suggest consistent formatting of state names and warn about confusing names',
      category: 'Stylistic Issues',
      url: getDocsUrl('state-names'),
      recommended: 'warn',
    },
    fixable: 'code',
    schema: [
      {
        enum: ['camelCase', 'snakeCase', 'pascalCase', 'regex'],
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
      invalidStateName: 'Prefer "{{fixedName}}" over "{{name}}" state name',
      stateNameViolatesRegex:
        'State name "{{name}}" violates regular expression /{{regex}}/',
      stateNameIsReservedWord:
        '"{{name}}" has a special meaning to XState in some contexts. Using it as a state name is confusing.',
    },
  },

  create: function (context) {
    const mode = context.options[0] || 'camelCase'
    const regexOption =
      mode === 'regex'
        ? (context.options[1] && context.options[1].regex) || defaultRegex
        : null
    const regex = regexOption !== null ? new RegExp(regexOption) : null

    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] > ObjectExpression > Property':
        function (node) {
          // key names [varName] are dynamic values and cannot be linted
          if (node.computed) {
            return
          }
          const name =
            node.key.type === 'Identifier' ? node.key.name : node.key.value

          if (isReservedXStateWord(name)) {
            context.report({
              node,
              data: { name },
              messageId: 'stateNameIsReservedWord',
            })
            return
          }

          if (regex && !regex.test(name)) {
            context.report({
              node,
              data: { name, regex: regexOption },
              messageId: 'stateNameViolatesRegex',
            })
            return
          }

          const fixedName = fixName(name, mode)
          if (name !== fixedName) {
            const quote = mustBeQuoted(fixedName) ? "'" : ''
            context.report({
              node,
              messageId: 'invalidStateName',
              data: { fixedName, name },
              fix(fixer) {
                return fixer.replaceText(
                  node.key,
                  `${quote}${fixedName}${quote}`
                )
              },
            })
          }
        },
    }
  },
}
