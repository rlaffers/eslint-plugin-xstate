const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-inline-implementation')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          active: {
            invoke: {
              src: 'myService',
            },
            entry: 'myAction',
            on: {
              OFF: {
                cond: 'myGuard',
                target: 'inactive',
                actions: 'myAction',
                activities: 'myActivity',
              },
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
            active: {
              invoke: {
                src: () => {},
              },
              entry: () => {},
              on: {
                OFF: {
                  cond: () => {},
                  target: 'inactive',
                  actions: () => {},
                  activities: () => {},
                },
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveServiceToOptions' },
        { messageId: 'moveActionsToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionsToOptions' },
        { messageId: 'moveActivitiesToOptions' },
      ],
    },
    {
      code: `
        createMachine({
          states: {
            active: {
              invoke: {
                src: myService,
              },
              entry: myAction,
              on: {
                OFF: {
                  cond: myGuard,
                  target: 'inactive',
                  actions: myAction,
                  activities: myActivity,
                },
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveServiceToOptions' },
        { messageId: 'moveActionsToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionsToOptions' },
        { messageId: 'moveActivitiesToOptions' },
      ],
    },
    {
      code: `
        createMachine({
          invoke: [
            { src: () => {} },
            { src: myService },
          ]
        })
      `,
      errors: [
        { messageId: 'moveServiceToOptions' },
        { messageId: 'moveServiceToOptions' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-inline-implementation', rule, tests)
