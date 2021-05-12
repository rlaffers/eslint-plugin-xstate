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
                actions: ['myAction1', 'myAction2'],
              },
            },
            activities: 'myActivity',
          },
        },
      })
    `,
    // inlined action creators are ok with allowKnownActionCreators=true
    `
      /* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
      createMachine({
        states: {
          active: {
            entry: assign(),
            on: {
              OFF: {
                actions: [send('EVENT'), assign()],
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
                },
              },
              activities: () => {},
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveServiceToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActivityToOptions' },
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
                },
              },
              activities: myActivity,
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveServiceToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActivityToOptions' },
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
    // actions arrays with some valid, some invalid items
    {
      code: `
        /* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
        createMachine({
          states: {
            active: {
              entry: ['someAction', assign(), () => {}],
              on: {
                OFF: {
                  actions: ['someAction', someAction, () => {}, send()],
                },
              },
              activities: [myActivity, 'myActivity'],
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActivityToOptions' },
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
