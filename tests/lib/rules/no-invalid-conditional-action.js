const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-invalid-conditional-action')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    // transitions within the choose action creator
    withVersion(
      4,
      `
      createMachine({
        states: {
          active: {
            on: {
              EVENT1: {
                actions: choose([{
                  cond: 'myGuard',
                  actions: [],
                }]),
              },
            },
            entry: choose([{
              cond: 'myGuard',
              actions: [],
            }]),
          }
        }
      })
      `
    ),
    withVersion(
      5,
      `
      createMachine({
        states: {
          active: {
            on: {
              EVENT1: {
                actions: choose([{
                  guard: 'myGuard',
                  actions: [],
                }]),
              },
            },
            entry: choose([{
              guard: 'myGuard',
              actions: [],
            }]),
          }
        }
      })
      `
    ),
    // no errors outside ofc reateMachine by default
    withVersion(
      4,
      `
        const config = {
          states: {
            active: {
              on: {
                EVENT1: {
                  actions: choose([{
                    cond: 'myGuard',
                    guard: '???',
                    invoke: '???',
                    actions: [],
                  }]),
                },
              },
              entry: choose([{
                cond: 'myGuard',
                guard: '???',
                invoke: '???',
                actions: [],
              }]),
            }
          }
        }
      `
    ),
    withVersion(
      5,
      `
        const config = {
          states: {
            active: {
              on: {
                EVENT1: {
                  actions: choose([{
                    guard: 'myGuard',
                    cond: '???',
                    invoke: '???',
                    actions: [],
                  }]),
                },
              },
              entry: choose([{
                guard: 'myGuard',
                cond: '???',
                invoke: '???',
                actions: [],
              }]),
            }
          }
        }
      `
    ),
  ],
  invalid: [
    // transitions within the choose action creator
    withVersion(4, {
      code: `
          createMachine({
            states: {
              active: {
                on: {
                  EVENT1: {
                    actions: choose([{
                      cond: 'myGuard',
                      guard: '???',
                      invoke: '???',
                      actions: [],
                    }]),
                  },
                },
                entry: choose([{
                  cond: 'myGuard',
                  guard: '???',
                  invoke: '???',
                  actions: [],
                }]),
              }
            }
          })
        `,
      errors: [
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'guard' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'guard' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
    withVersion(5, {
      code: `
          createMachine({
            states: {
              active: {
                on: {
                  EVENT1: {
                    actions: choose([{
                      cond: '???',
                      guard: 'myGuard',
                      invoke: '???',
                      actions: [],
                    }]),
                  },
                },
                entry: choose([{
                  cond: '???',
                  guard: 'myGuard',
                  invoke: '???',
                  actions: [],
                }]),
              }
            }
          })
        `,
      errors: [
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'cond' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'cond' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
    withVersion(4, {
      code: `
        createMachine({
          states: {
            active: {
              on: {
                EVENT1: {
                  actions: [
                    choose(),
                    choose({}),
                    choose(() => []),
                    choose(undefined),
                  ],
                },
              },
              entry: choose(''),
              exit: choose(null),
            }
          }
        })
      `,
      errors: [
        {
          messageId: 'missingFirstArgumentForChoose',
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'object' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'function' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'undefined' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'string' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'null' },
        },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            active: {
              on: {
                EVENT1: {
                  actions: [
                    choose(),
                    choose({}),
                    choose(() => []),
                    choose(undefined),
                  ],
                },
              },
              entry: choose(''),
              exit: choose(null),
            }
          }
        })
      `,
      errors: [
        {
          messageId: 'missingFirstArgumentForChoose',
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'object' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'function' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'undefined' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'string' },
        },
        {
          messageId: 'invalidArgumentForChoose',
          data: { argType: 'null' },
        },
      ],
    }),
    // should report errors outside of createMachine with the directive
    withVersion(4, {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            active: {
              on: {
                EVENT1: {
                  actions: choose([{
                    cond: 'myGuard',
                    guard: '???',
                    invoke: '???',
                    actions: [],
                  }]),
                },
              },
              entry: choose([{
                cond: 'myGuard',
                guard: '???',
                invoke: '???',
                actions: [],
              }]),
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'guard' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'guard' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
    withVersion(5, {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            active: {
              on: {
                EVENT1: {
                  actions: choose([{
                    guard: 'myGuard',
                    cond: '???',
                    invoke: '???',
                    actions: [],
                  }]),
                },
              },
              entry: choose([{
                guard: 'myGuard',
                cond: '???',
                invoke: '???',
                actions: [],
              }]),
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'cond' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'cond' },
        },
        {
          messageId: 'invalidConditionalActionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-invalid-conditional-action', rule, tests)
