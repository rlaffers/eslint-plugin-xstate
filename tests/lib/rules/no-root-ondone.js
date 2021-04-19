const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-root-ondone')

const tests = {
  valid: [
    `
      createMachine({
        initial: 'active',
        states: {
          active: {
            invoke: {
              src: 'someService',
              onDone: 'passive',
            },
          },
          passive: {
            invoke: {
              src: 'someService',
              onDone: {
                target: 'active',
              },
            },
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'active',
        states: {
          active: {
            initial: 'hot',
            states: {
              hot: {},
              cold: {},
            },
            onDone: 'passive',
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'active',
        states: {
          initializing: {
            type: 'parallel',
            states: {
              loadingImage: {},
              loadingText: {},
            },
            onDone: 'ready',
          },
        },
      })
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          onDone: {},
        })
      `,
      errors: [{ messageId: 'rootOnDoneIsForbidden' }],
    },
    {
      code: `
        createMachine({
          onDone: 'stopped',
        })
      `,
      errors: [{ messageId: 'rootOnDoneIsForbidden' }],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-root-ondone', rule, tests)
