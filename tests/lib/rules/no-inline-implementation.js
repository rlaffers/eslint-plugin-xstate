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
    // onDone, onError, array of transitions
    `
      createMachine({
        states: {
          active: {
            invoke: {
              src: 'myService',
              onDone: {
                cond: 'myGuard',
                actions: 'myAction1',
              },
              onError: {
                cond: 'myGuard',
                actions: ['myAction1', 'myAction2'],
              },
            },
            on: {
              OFF: [
                {
                  cond: 'myGuard',
                  target: 'inactive',
                  actions: ['myAction1', 'myAction2'],
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
    // inline implementations inside array of transitions
    {
      code: `
        createMachine({
          states: {
            active: {
              on: {
                OFF: [{
                  cond: () => {},
                  target: 'inactive',
                  actions: [someAction, () => {}],
                }],
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
      ],
    },
    // inline implementations inside onDone, onError transitions
    {
      code: `
        createMachine({
          states: {
            active: {
              invoke: {
                src: 'myService',
                onDone: {
                  cond: myGuard,
                  actions: () => {},
                },
                onError: {
                  cond: () => {},
                  actions: [myAction, () => {}],
                },
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
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
