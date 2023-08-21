const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-invalid-transition-props')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
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
          ready: {
            on: [
              { event: "*", target: "elsewhere", internal: false },
              { event: "SOME_EVENT", target: "here", cond: () => true },
            ],
          },
        },
        on: {
          EVENT: [{
            cond: () => true,
            target: 'active',
          }],
        },
      })
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        states: {
          idle: {
            on: {
              EVENT: {
                guard: () => true,
                target: 'active',
                actions: [],
                reenter: true,
                description: 'some text',
              },
            },
          },
          ready: {
            on: [
              { event: "*", target: "elsewhere", reenter: true },
              { event: "SOME_EVENT", target: "here", guard: () => true },
            ],
          },
        },
        on: {
          EVENT: [{
            guard: () => true,
            target: 'active',
          }],
        },
      })
    `
    ),
    withVersion(
      4,
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
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        states: {
          idle: {
            invoke: {
              src: 'someService',
              onDone: {
                guard: () => true,
                target: 'active',
                actions: [],
                reenter: true,
                description: 'some text',
              },
              onError: [
                {
                  guard: () => false,
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
    `
    ),
    // transitions within the "always" block
    withVersion(
      4,
      `
      createMachine({
        states: {
          deciding: {
            always: [
              {
                cond: 'myGuard',
                target: 'active',
                actions: [],
              }
            ]
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
          deciding: {
            always: [
              {
                guard: 'myGuard',
                target: 'active',
                actions: [],
              }
            ]
          }
        }
      })
      `
    ),
  ],
  invalid: [
    withVersion(4, {
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
            ready: {
              on: [
                { event: "*", target: "elsewhere", beeep: '???' },
                { event: "SOME_EVENT", target: "here", guard: () => true },
              ],
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
        { messageId: 'invalidTransitionProperty', data: { propName: 'beeep' } },
        { messageId: 'invalidTransitionProperty', data: { propName: 'guard' } },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            idle: {
              on: {
                EVENT: {
                  target: 'active',
                  foo: '???',
                  cond: () => true,
                  in: 'otherState.ready',
                  internal: false,
                },
              },
            },
            ready: {
              on: [
                { event: "*", target: "elsewhere", internal: '???' },
                { event: "SOME_EVENT", target: "here", cond: () => true },
              ],
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
        { messageId: 'invalidTransitionProperty', data: { propName: 'cond' } },
        { messageId: 'invalidTransitionProperty', data: { propName: 'in' } },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'internal' },
        },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'internal' },
        },
        { messageId: 'invalidTransitionProperty', data: { propName: 'cond' } },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
    withVersion(4, {
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
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            idle: {
              invoke: {
                src: 'someService',
                onDone: {
                  target: 'active',
                  always: '???',
                  in: 'otherState.ready',
                },
                onError: [
                  {
                    cond: () => false,
                    target: 'failed',
                    after: 1000,
                    internal: false,
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
        { messageId: 'invalidTransitionProperty', data: { propName: 'in' } },
        { messageId: 'invalidTransitionProperty', data: { propName: 'cond' } },
        { messageId: 'invalidTransitionProperty', data: { propName: 'after' } },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'internal' },
        },
        { messageId: 'invalidTransitionProperty', data: { propName: 'entry' } },
      ],
    }),
    // transitions within the "always" block
    withVersion(4, {
      code: `
          createMachine({
            states: {
              deciding: {
                always: [
                  {
                    unknown: '???',
                    cond: 'myGuard',
                    guard: '???',
                    invoke: '???',
                    target: 'active',
                    actions: [],
                  }
                ]
              }
            }
          })
        `,
      errors: [
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'unknown' },
        },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'guard' },
        },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'invoke' },
        },
      ],
    }),
    withVersion(5, {
      code: `
          createMachine({
            states: {
              deciding: {
                always: [
                  {
                    unknown: '???',
                    cond: '???',
                    guard: 'myGuard',
                    invoke: '???',
                    target: 'active',
                    actions: [],
                  }
                ]
              }
            }
          })
        `,
      errors: [
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'unknown' },
        },
        {
          messageId: 'invalidTransitionProperty',
          data: { propName: 'cond' },
        },
        {
          messageId: 'invalidTransitionProperty',
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
ruleTester.run('no-invalid-transition-props', rule, tests)
