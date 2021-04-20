const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/entry-exit-action')

const tests = {
  valid: [
    `
      createMachine({
        entry: 'someAction',
        exit: ['someAction', () => {}, assign({ foo: true }), someAction],
      })
    `,
    `
      createMachine({
        entry: choose([
          {
            cond: 'someGuard',
            actions: 'someAction',
          },
          {
            actions: 'defaultAction',
          },
        ]),
      })
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          entry: [
            {
              cond: 'someGuard',
              actions: 'someAction',
            },
            {
              actions: 'defaultAction',
            },
          ],
          exit: [
            {
              cond: 'someGuard',
              actions: 'someAction',
            },
            {
              actions: 'defaultAction',
            },
          ],
        })
      `,
      errors: [
        { messageId: 'invalidGuardedEntryAction' },
        { messageId: 'invalidEntryAction' },
        { messageId: 'invalidGuardedExitAction' },
        { messageId: 'invalidExitAction' },
      ],
    },
    {
      code: `
        createMachine({
          entry: 123, // numbers are invalid
          exit: {}, // objects without a "type" property are invalid
        })
      `,
      errors: [
        { messageId: 'invalidEntryAction' },
        { messageId: 'invalidExitAction' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('entry-exit-action', rule, tests)
