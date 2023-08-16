const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-async-guard')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        on: {
          EVENT: {
            cond: () => {},
            target: 'active',
          },
        },
      })
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        on: {
          EVENT: {
            guard: () => {},
            target: 'active',
          },
        },
      })
    `
    ),
    withVersion(
      4,
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
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        states: {
          active: {
            invoke: {
              src: 'myService',
              onDone: {
                guard: function () {},
                target: 'finished',
              },
            },
          },
        },
      })
    `
    ),
    withVersion(
      4,
      `
      createMachine(
        {},
        {
          guards: {
            myGuard: () => {},
            myGuard2: function () {},
            myGuard3() {},
          },
        }
      )
    `
    ),
  ],
  invalid: [
    withVersion(4, {
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
    }),
    withVersion(5, {
      code: `
        createMachine({
          entry: choose([
            {
              guard: async () => {},
              actions: 'myAction',
            },
          ]),
          states: {
            active: {
              invoke: {
                src: 'myService',
                onDone: {
                  guard: async function () {},
                  target: 'finished',
                },
              },
            },
          },
          on: {
            EVENT: {
              guard: async () => {},
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
    }),
    // async guard in machine options
    withVersion(4, {
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
    }),
    withVersion(5, {
      code: `
        createMachine(
          {},
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
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
})
ruleTester.run('no-async-guard', rule, tests)
