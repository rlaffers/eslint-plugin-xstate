const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/prefer-predictable-action-arguments')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        predictableActionArguments: true
      })
    `
    ),
    withVersion(
      5,
      `
      createMachine({})
    `
    ),
  ],
  invalid: [
    withVersion(4, {
      code: `
        createMachine({
          predictableActionArguments: false
        })
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
      output: `
        createMachine({
          predictableActionArguments: true
        })
      `,
    }),
    withVersion(5, {
      code: `
        createMachine({
          predictableActionArguments: false
        })
      `,
      errors: [{ messageId: 'deprecatedPredictableActionArguments' }],
      output: `
        createMachine({
          
        })
      `,
    }),
    withVersion(4, {
      code: `
        createMachine({})
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
      output: `
        createMachine({ predictableActionArguments: true })
      `,
    }),
    withVersion(4, {
      code: `
        createMachine({
          initial: 'ready'
        })
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
      output: `
        createMachine({
          predictableActionArguments: true,
initial: 'ready'
        })
      `,
    }),
    withVersion(4, {
      code: `
        createMachine({
          states: {},
          predictableActionArguments: 42
        })
      `,
      errors: [{ messageId: 'preferPredictableActionArguments' }],
      output: `
        createMachine({
          states: {},
          predictableActionArguments: true
        })
      `,
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('prefer-predictable-action-arguments', rule, tests)
