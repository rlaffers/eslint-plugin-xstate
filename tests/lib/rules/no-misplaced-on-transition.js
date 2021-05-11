const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-misplaced-on-transition')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          active: {
            on: {
              EVENT: 'passive',
            },
          },
        },
      })
    `,
    `
      createMachine({
        states: {
          active: {},
        },
        on: {
          EVENT: 'passive',
        },
      })
    `,
    `
      createMachine({
        states: {
          active: {
            invoke: {
              src: 'someService',
            },
            on: {
              EVENT: 'passive',
            },
          },
        },
      })
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          states: {
            on: {
              EVENT: 'passive',
            },
            active: {},
          },
        })
      `,
      errors: [{ messageId: 'onTransitionInsideStatesForbidden' }],
    },
    {
      code: `
        createMachine({
          states: {
            active: {
              invoke: {
                src: 'someService',
                on: {
                  EVENT: 'passive',
                },
              },
            },
          },
        })
      `,
      errors: [{ messageId: 'onTransitionInsideInvokeForbidden' }],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-misplaced-on-transition', rule, tests)
