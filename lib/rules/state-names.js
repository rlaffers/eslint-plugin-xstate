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

const stateNodeDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] > ObjectExpression > Property'
const targetDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] Property[key.name="target"][value.type="Literal"]'
const targetArrayStringDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="states"] Property[key.name="target"][value.type="ArrayExpression"] > ArrayExpression > Literal'
const simpleEventTargetDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"] > ObjectExpression > Property[value.type="Literal"]'
const simpleOnDoneOnErrorTargetDeclaration =
  'CallExpression[callee.name=/^createMachine$|^Machine$/] Property:matches([key.name="onDone"], [key.name="onError"])[value.type="Literal"]'

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

    function validate(name, node, mustQuote = false, fix = fixName) {
      if (regex && !regex.test(name)) {
        context.report({
          node,
          data: { name, regex: regexOption },
          messageId: 'stateNameViolatesRegex',
        })
        return
      }

      const fixedName = fix(name, mode)
      if (name !== fixedName) {
        const quote = mustQuote || mustBeQuoted(fixedName) ? "'" : ''
        context.report({
          node,
          messageId: 'invalidStateName',
          data: { fixedName, name },
          fix(fixer) {
            return fixer.replaceText(node, `${quote}${fixedName}${quote}`)
          },
        })
      }
    }

    function validateTargetLiteral(node) {
      if (node.type !== 'Literal' || typeof node.value !== 'string') {
        // skip targets which are not strings
        return
      }
      const name = node.value
      // target may come in one of 3 formats: "myState", ".myState", "#id.myState"
      if (name[0] === '#') {
        const fixTargetWithID = (target, mode) => {
          const match = target.match(/^(#[^.]+)(.*)/)
          if (!match) {
            console.error(
              'The target value unexpectedly does not beging with #id'
            )
            return target
          }

          return (
            match[1] +
            match[2]
              .split('.')
              .map((x) => (x.length < 1 ? x : fixName(x, mode)))
              .join('.')
          )
        }

        return validate(name, node, true, fixTargetWithID)
      }

      if (name.match(/\./)) {
        // fix only individual parts:
        // .my_state -> .myState
        // .my_state.subState.sub_sub#state -> .myState.subState.subSubState
        const fixTargetWithDots = (target, mode) =>
          target
            .split('.')
            .map((x) => (x.length < 1 ? x : fixName(x, mode)))
            .join('.')

        return validate(name, node, true, fixTargetWithDots)
      }
      return validate(name, node, true)
    }

    function validateTarget(node) {
      // skip [target]: 'whatever'
      if (node.computed) {
        return
      }
      return validateTargetLiteral(node.value)
    }

    return {
      [stateNodeDeclaration]: function (node) {
        if (node.computed) {
          return
        }
        const name =
          node.key.type === 'Identifier' ? node.key.name : node.key.value
        if (isReservedXStateWord(name)) {
          context.report({
            node: node.key,
            data: { name },
            messageId: 'stateNameIsReservedWord',
          })
          return
        }

        return validate(name, node.key)
      },
      [targetDeclaration]: validateTarget,
      [simpleEventTargetDeclaration]: validateTarget,
      [simpleOnDoneOnErrorTargetDeclaration]: validateTarget,
      [targetArrayStringDeclaration]: validateTargetLiteral,
    }
  },
}
