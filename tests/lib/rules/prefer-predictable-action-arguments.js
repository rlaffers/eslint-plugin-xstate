const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/prefer-predictable-action-arguments')

const tests = {
  valid: [
    `
      createMachine({
        predictableActionArguments: true
      })
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          predictableActionArguments: false
        })
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
    },
    {
      code: `
        createMachine({
          states: {},
        })
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
    },
    {
      code: `
        createMachine({
          states: {},
          predictableActionArguments: 42
        })
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('prefer-predictable-action-arguments', rule, tests)
