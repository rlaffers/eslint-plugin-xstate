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
    `
      createMachine({
        initial: 'loading',
        states: {
          loading: {
            invoke: {
              src: 'fetchData',
              onDone: 'ready',
            },
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'loading',
        states: {
          loading: {
            invoke: [{
              src: 'fetchData',
              onDone: 'ready',
            }],
          },
        },
      })
    `,
    // no errors outside of createMachine by default
    `
      const config = {
        states: {
          active: {
            type: 'atomic',
            onDone: 'idle',
          },
          hist: {
            type: 'history',
            onDone: 'idle',
          },
          idle: {
            onDone: 'active',
          },
          finished: {
            type: 'final',
            onDone: {
              actions: () => {},
            },
          }
        },
      }
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          states: {
            active: {
              type: 'atomic',
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
            active: {
              onDone: 'idle',
            },
          },
        })
      `,
      errors: [{ messageId: 'onDoneUsedIncorrectly' }],
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
    {
      code: `
        createMachine({
          on: {
            onDone: 'idle',
          },
        })
      `,
      errors: [{ messageId: 'onDoneUsedIncorrectly' }],
    },
    // errors reported outside of createMachine if there is the comment directive
    {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            active: {
              type: 'atomic',
              onDone: 'idle',
            },
            hist: {
              type: 'history',
              onDone: 'idle',
            },
            idle: {
              onDone: 'active',
            },
            finished: {
              type: 'final',
              onDone: {
                actions: () => {},
              },
            }
          },
        }
      `,
      errors: [
        { messageId: 'onDoneOnAtomicStateForbidden' },
        { messageId: 'onDoneOnHistoryStateForbidden' },
        { messageId: 'onDoneUsedIncorrectly' },
        { messageId: 'onDoneOnFinalStateForbidden' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-ondone-outside-compound-state', rule, tests)
