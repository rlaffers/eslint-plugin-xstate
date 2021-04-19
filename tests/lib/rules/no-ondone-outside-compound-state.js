const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-ondone-outside-compound-state')

const tests = {
  valid: [
    `
      createMachine({
        initial: 'loading',
        states: {
          loading: {
            initial: 'fetching',
            states: {
              fetching: {},
              fetched: {},
            },
            onDone: 'ready',
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'loading',
        states: {
          loading: {
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
          states: {
            active: {
              onDone: 'idle',
            },
          },
        })
      `,
      errors: [{ messageId: 'onDoneOnAtomicStateForbidden' }],
    },
    {
      code: `
        createMachine({
          states: {
            stopped: {
              type: 'final',
              onDone: {
                actions: () => {},
              },
            },
          },
        })
      `,
      errors: [{ messageId: 'onDoneOnFinalStateForbidden' }],
    },
    {
      code: `
        createMachine({
          states: {
            hist: {
              type: 'history',
              onDone: 'active',
            },
          },
        })
      `,
      errors: [{ messageId: 'onDoneOnHistoryStateForbidden' }],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-ondone-outside-compound-state', rule, tests)
