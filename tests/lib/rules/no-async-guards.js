const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-async-guard')

const tests = {
  valid: [
    `
      createMachine({
        on: {
          EVENT: {
            cond: () => {},
            target: 'active',
          },
        },
      })
    `,
    `
      createMachine({
        states: {
          active: {
            invoke: {
              src: 'myService',
              onDone: {
                cond: function () {},
                target: 'finished',
              },
            },
          },
        },
      })
    `,
    `
      createMachine(
        {
          on: {
            EVENT: {
              cond: 'myGuard',
              target: 'active',
            },
          },
        },
        {
          guards: {
            myGuard: () => {},
            myGuard2: function () {},
            myGuard3() {},
          },
        }
      )
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          entry: choose([
            {
              cond: async () => {},
              actions: 'myAction',
            },
          ]),
          states: {
            active: {
              invoke: {
                src: 'myService',
                onDone: {
                  cond: async function () {},
                  target: 'finished',
                },
              },
            },
          },
          on: {
            EVENT: {
              cond: async () => {},
              target: 'active',
            },
          },
        })
      `,
      errors: [
        { messageId: 'guardCannotBeAsync' },
        { messageId: 'guardCannotBeAsync' },
        { messageId: 'guardCannotBeAsync' },
      ],
    },
    // async guard in machine options
    {
      code: `
        createMachine(
          {
            on: {
              EVENT: {
                cond: 'myGuard',
                target: 'active',
              },
            },
          },
          {
            guards: {
              myGuard: async () => {},
              myGuard2: async function () {},
              async myGuard3() {},
            },
          }
        )
      `,
      errors: [
        { messageId: 'guardCannotBeAsync' },
        { messageId: 'guardCannotBeAsync' },
        { messageId: 'guardCannotBeAsync' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
})
ruleTester.run('no-async-guard', rule, tests)
