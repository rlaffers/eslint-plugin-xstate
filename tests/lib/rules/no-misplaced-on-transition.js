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
    // no errors outside of createmachine by default
    `
      const config = {
        states: {
          on: {
            EVENT: 'passive',
          },
        },
        invoke: {
          on: {
            EVENT: 'passive',
          },
        }
      }
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
    // errors reported outside of createMachine if there is the comment directive
    {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            on: {
              EVENT: 'passive',
            },
          },
          invoke: {
            on: {
              EVENT: 'passive',
            },
          }
        }
      `,
      errors: [
        { messageId: 'onTransitionInsideStatesForbidden' },
        { messageId: 'onTransitionInsideInvokeForbidden' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-misplaced-on-transition', rule, tests)
