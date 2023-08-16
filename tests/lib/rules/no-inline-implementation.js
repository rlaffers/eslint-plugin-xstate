const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-inline-implementation')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine(
        {
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
        }, 
        {
          services: {
            myService: () => {},
          },
          actions: {
            myAction: () => {},
            myAction1: () => {},
            myAction2: () => {},
          },
          guards: {
            myGuard: () => {},
          },
          activities: {
            myActivity: () => {},
          },
        }
      )
    `
    ),
    withVersion(
      5,
      `
      createMachine(
        {
          states: {
            active: {
              invoke: {
                src: 'myActor',
              },
              entry: 'myAction',
              on: {
                OFF: {
                  guard: 'myGuard',
                  target: 'inactive',
                  actions: ['myAction1', 'myAction2'],
                },
              },
            },
          },
        },
        {
          actors: {
            myActor: () => {},
          },
          actions: {
            myAction: () => {},
            myAction1: () => {},
            myAction2: () => {},
          },
          guards: {
            myGuard: () => {},
          },
        }
      )
    `
    ),
    // inlined action creators are ok with allowKnownActionCreators=true
    withVersion(
      4,
      `
      /* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
      createMachine(
        {
          states: {
            active: {
              entry: assign({
                childActor: () => spawn('childActor'),
              }),
              on: {
                OFF: {
                  actions: [send('EVENT'), assign()],
                },
              },
              exit: choose([{
                cond: 'myGuard',
                actions: 'myAction',
              }]),
            },
          },
        },
        {
          services: {
            childActor: () => {},
          },
          guards: {
            myGuard: () => {},
          },
          actions: {
            myAction: () => {},
            choosableAction: choose([{
              cond: () => {},
              actions: () => {},
            }]),
          },
        }
      )
    `
    ),
    withVersion(
      5,
      `
      /* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
      createMachine(
        {
          states: {
            active: {
              entry: assign({
                childActor: ({ spawn }) => spawn('childActor'),
              }),
              on: {
                OFF: {
                  actions: [sendParent('EVENT'), assign()],
                },
              },
              exit: choose([{
                guard: 'myGuard',
                actions: 'myAction',
              }]),
            },
          },
        },
        {
          actors: {
            childActor: () => {},
          },
          guards: {
            myGuard: () => {},
          },
          actions: {
            myAction: () => {},
            choosableAction: choose([{
              guard: () => {},
              actions: () => {},
            }]),
          },
        }
      )
    `
    ),
    // onDone, onError, array of transitions
    withVersion(
      4,
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
    `
    ),
    // inlined guard creators are ok if they match guardCreatorRegex
    withVersion(
      4,
      `
      /* eslint no-inline-implementation: [ "warn", { "guardCreatorRegex": "and|or|not" } ] */
      createMachine({
        states: {
          active: {
            on: {
              OFF: {
                cond: and(['guard1', 'guard2']),
                target: 'inactive',
              },
            },
          },
        },
      })
    `
    ),
    // inlined guard creators are ok if they match guardCreatorRegex
    withVersion(
      5,
      `
      /* eslint no-inline-implementation: [ "warn", { "guardCreatorRegex": "^createGuard$" } ] */
      createMachine({
        states: {
          active: {
            on: {
              OFF: {
                guard: createGuard('param'),
                target: 'inactive',
              },
            },
          },
        },
      })
    `
    ),
    // built in higher level guards are valid with xstate v5
    withVersion(
      5,
      `
      createMachine({
        states: {
          active: {
            on: {
              OFF: [
                {
                  guard: and(['guard1', 'guard2']),
                  target: 'inactive',
                },
                {
                  guard: or(['guard1', 'guard2']),
                  target: 'active',
                },
                {
                  guard: not('guard1'),
                  target: 'hibernating',
                },
                {
                  guard: stateIn('mode.active'),
                  target: 'hibernating',
                },
              ],
            },
          },
        },
      })
    `
    ),
    // inlined action creators are ok if they match actionCreatorRegex
    withVersion(
      4,
      `
      /* eslint no-inline-implementation: [ "warn", { "actionCreatorRegex": "^customAction$" } ] */
      createMachine({
        states: {
          active: {
            on: {
              OFF: {
                target: 'inactive',
                actions: customAction(),
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
      /* eslint no-inline-implementation: [ "warn", { "actionCreatorRegex": "^customAction$" } ] */
      createMachine({
        states: {
          active: {
            on: {
              OFF: {
                target: 'inactive',
                actions: customAction(),
              },
            },
          },
        },
      })
    `
    ),
    // inlined service creators are ok if they match actorCreatorRegex
    withVersion(
      4,
      `
      /* eslint no-inline-implementation: [ "warn", { "actorCreatorRegex": "^createChildMachine|createBeeper$" } ] */
      createMachine({
        states: {
          active: {
            invoke: {
              src: createChildMachine(),
            },
            activities: createBeeper(),
          },
        },
      })
    `
    ),
    withVersion(
      5,
      `
      /* eslint no-inline-implementation: [ "warn", { "actorCreatorRegex": "^createChildMachine$" } ] */
      createMachine({
        states: {
          active: {
            invoke: {
              src: createChildMachine(),
            },
          },
        },
      })
    `
    ),
  ],
  invalid: [
    withVersion(4, {
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
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActivityToOptions' },
      ],
    }),
    withVersion(5, {
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
                  guard: () => {},
                  target: 'inactive',
                  actions: () => {},
                },
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
      ],
    }),
    withVersion(4, {
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
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActivityToOptions' },
      ],
    }),
    withVersion(5, {
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
                  guard: myGuard,
                  target: 'inactive',
                  actions: myAction,
                },
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
      ],
    }),
    withVersion(4, {
      code: `
        createMachine({
          invoke: [
            { src: () => {} },
            { src: myActor },
          ]
        })
      `,
      errors: [
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActorToOptions' },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          invoke: [
            { src: () => {} },
            { src: myActor },
          ]
        })
      `,
      errors: [
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActorToOptions' },
      ],
    }),
    // actions arrays with some valid, some invalid items
    withVersion(4, {
      code: `
        /* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
        const { createMachine, spawn } = require('xstate')
        createMachine({
          states: {
            active: {
              entry: ['someAction', assign(), () => {}],
              on: {
                OFF: {
                  actions: [
                    'someAction',
                    someAction,
                    () => {},
                    send(),
                    choose([{
                      cond: () => {},
                      actions: () => {},
                    }]),
                  ],
                },
              },
              activities: [myActivity, 'myActivity'],
              exit: assign({
                childActor1: () => spawn(() => {}),
                childActor2: () => spawn(childActor),
              }),
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActivityToOptions' },
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActorToOptions' },
      ],
    }),
    withVersion(5, {
      code: `
        /* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
        const { createMachine } = require('xstate')
        createMachine({
          states: {
            active: {
              entry: ['someAction', assign(), () => {}],
              on: {
                OFF: {
                  actions: [
                    'someAction',
                    someAction,
                    () => {},
                    sendParent(),
                    choose([{
                      guard: () => {},
                      actions: () => {},
                    }]),
                  ],
                },
              },
              exit: assign({
                childActor1: ({ spawn }) => spawn(() => {}),
                childActor2: ({ spawn }) => spawn(childActor),
              }),
            },
          },
        })
      `,
      errors: [
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveGuardToOptions' },
        { messageId: 'moveActionToOptions' },
        { messageId: 'moveActorToOptions' },
        { messageId: 'moveActorToOptions' },
      ],
    }),
    // inline implementations inside array of transitions
    withVersion(4, {
      code: `
        createMachine({
          states: {
            active: {
              on: {
                OFF: [{
                  cond: () => {},
                  target: 'inactive',
                  actions: [someAction, () => {}, foo()],
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
        { messageId: 'moveActionToOptions' },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            active: {
              on: {
                OFF: [{
                  guard: () => {},
                  target: 'inactive',
                  actions: [someAction, () => {}, foo()],
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
        { messageId: 'moveActionToOptions' },
      ],
    }),
    // inline implementations inside onDone, onError transitions
    withVersion(4, {
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
                  cond: foo(),
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
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            active: {
              invoke: {
                src: 'myService',
                onDone: {
                  guard: myGuard,
                  actions: () => {},
                },
                onError: {
                  guard: foo(),
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
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-inline-implementation', rule, tests)
