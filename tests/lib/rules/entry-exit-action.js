const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/entry-exit-action')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        entry: 'someAction',
        exit: ['someAction', () => {}, assign({ foo: true }), someAction],
      })
    `
    ),
    withVersion(
      4,
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
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        entry: 'someAction',
        exit: ['someAction', () => {}, assign({ foo: true }), someAction],
      })
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        entry: choose([
          {
            guard: 'someGuard',
            actions: 'someAction',
          },
          {
            actions: 'defaultAction',
          },
        ]),
      })
    `
    ),
  ],
  invalid: [
    withVersion(4, {
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
    }),
    withVersion(4, {
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
    }),
    withVersion(5, {
      code: `
        createMachine({
          entry: [
            {
              guard: 'someGuard',
              actions: 'someAction',
            },
            {
              actions: 'defaultAction',
            },
          ],
          exit: [
            {
              guard: 'someGuard',
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
    }),
    withVersion(5, {
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
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('entry-exit-action', rule, tests)
