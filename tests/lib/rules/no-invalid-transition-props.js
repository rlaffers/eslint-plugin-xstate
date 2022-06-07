const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-invalid-transition-props')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          idle: {
            on: {
              EVENT: {
                cond: () => true,
                target: 'active',
                actions: [],
                in: 'otherState.ready',
                internal: false,
                description: 'some text',
              },
            },
          },
        },
        on: {
          EVENT: [{
            target: 'active',
          }],
        },
      })
    `,
    `
      createMachine({
        states: {
          idle: {
            invoke: {
              src: 'someService',
              onDone: {
                cond: () => true,
                target: 'active',
                actions: [],
                in: 'otherState.ready',
                internal: false,
                description: 'some text',
              },
              onError: [
                {
                  cond: () => false,
                  target: 'failed',
                  description: 'some text',
                },
                {
                  target: 'failed',
                  description: 'some text',
                },
              ],
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
            idle: {
              on: {
                EVENT: {
                  target: 'active',
                  foo: '???',
                },
              },
            },
          },
          on: {
            EVENT: [{
              invoke: '???',
            }],
          },
        })
      `,
      errors: [
        { messageId: 'invalidTransitionProperty', data: { propName: 'foo' } },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'invoke' },
        },
      ],
    },
    {
      code: `
        createMachine({
          states: {
            idle: {
              invoke: {
                src: 'someService',
                onDone: {
                  target: 'active',
                  always: '???',
                },
                onError: [
                  {
                    cond: () => false,
                    target: 'failed',
                    after: 1000,
                  },
                  {
                    target: 'failed',
                    entry: '???',
                  },
                ],
              },
            },
          },
        })
      `,
      errors: [
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'always' },
        },
        { messageId: 'invalidTransitionProperty', data: { propName: 'after' } },
        { messageId: 'invalidTransitionProperty', data: { propName: 'entry' } },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-invalid-transition-props', rule, tests)
