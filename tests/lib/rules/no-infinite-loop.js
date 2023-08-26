const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-infinite-loop')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        states: {
          deciding: {
            always: {
              target: 'idle',
            },
          },
        },
      })
    `
    ),
    // unconditional assign actions if they are not first
    withVersion(
      4,
      `
      createMachine({
        states: {
          deciding: {
            always: [
              {
                cond: (ctx) => ctx.count > 5,
                target: 'idle',
              },
              {
                actions: assign({ count: (ctx) => ctx.count + 1 }),
              },
            ],
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
          deciding: {
            always: [
              {
                guard: ({ context }) => context.count > 5,
                target: 'idle',
              },
              {
                actions: assign({ count: ({ context }) => context.count + 1 }),
              },
            ],
          },
        },
      })
    `
    ),
    // conditional assign actions
    withVersion(
      4,
      `
      createMachine({
        states: {
          deciding: {
            always: [
              {
                cond: (ctx) => ctx.count > 5,
                actions: assign({ count: (ctx) => ctx.count + 1 }),
              },
            ],
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
          deciding: {
            always: [
              {
                guard: ({ context }) => context.count > 5,
                actions: assign({ count: ({ context }) => context.count + 1 }),
              },
            ],
          },
        },
      })
    `
    ),
    // conditional self transition with assign action
    withVersion(
      4,
      `
      createMachine({
        states: {
          deciding: {
            always: [
              {
                cond: (ctx) => ctx.count > 5,
                target: 'deciding',
                actions: assign({ count: (ctx) => ctx.count + 1 }),
              },
            ],
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
          deciding: {
            always: [
              {
                guard: ({ context }) => context.count > 5,
                target: 'deciding',
                actions: assign({ count: ({ context }) => context.count + 1 }),
              },
            ],
          },
        },
      })
    `
    ),
    // unconditional self transition with assign actions if they are not first
    withVersion(
      4,
      `
      createMachine({
        states: {
          deciding: {
            always: [
              {
                cond: (ctx) => ctx.count > 5,
                target: 'idle',
              },
              {
                target: 'deciding',
                actions: assign({ count: (ctx) => ctx.count + 1 }),
              },
            ],
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
          deciding: {
            always: [
              {
                guard: ({ context }) => ctx.count > 5,
                target: 'idle',
              },
              {
                target: 'deciding',
                actions: assign({ count: ({ context }) => context.count + 1 }),
              },
            ],
          },
        },
      })
    `
    ),
    // outside of createMachine it is not linted by default
    withVersion(
      4,
      `
      const config = {
        states: {
          deciding: {
            always: {},
          },
        },
      }
    `
    ),
  ],
  invalid: [
    withVersion(4, {
      code: `
        createMachine({
          states: {
            deciding: {
              always: {},
            },
          },
        })
      `,
      errors: [{ messageId: 'noTargetNoGuardIsSingle' }],
    }),
    withVersion(4, {
      code: `
        createMachine({
          states: {
            deciding: {
              always: [
                {},
                { target: 'idle' },
                {},
                {
                  actions: () => {},
                }
              ],
            },
          },
        })
      `,
      errors: [
        { messageId: 'noTargetNoGuardIsFirst' },
        { messageId: 'emptyTransitionNotFirst' },
        { messageId: 'unconditionalTransitionNoTargetActionsWithoutAssign' },
      ],
    }),
    // self transitions
    withVersion(4, {
      code: `
        createMachine({
          states: {
            deciding: {
              id: '#foo',
              always: [
                { target: 'deciding' },
                { target: 'deciding' },
                {
                  target: '#foo',
                  actions: () => {},
                },
                {
                  cond: () => {},
                  target: 'deciding',
                },
                {
                  cond: () => {},
                  target: 'deciding',
                  actions: assign({}),
                },
              ],
            },
          },
        })
      `,
      errors: [
        { messageId: 'unconditionalSelfTransitionIsFirst' },
        { messageId: 'unconditionalSelfTransitionNotFirstNoAssign' },
        { messageId: 'unconditionalSelfTransitionNotFirstNoAssign' },
        { messageId: 'conditionalSelfTransitionNoAssign' },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            deciding: {
              id: '#foo',
              always: [
                { target: 'deciding' },
                { target: 'deciding' },
                {
                  target: '#foo',
                  actions: () => {},
                },
                {
                  guard: () => {},
                  target: 'deciding',
                },
                {
                  guard: () => {},
                  target: 'deciding',
                  actions: assign({}),
                },
              ],
            },
          },
        })
      `,
      errors: [
        { messageId: 'unconditionalSelfTransitionIsFirst' },
        { messageId: 'unconditionalSelfTransitionNotFirstNoAssign' },
        { messageId: 'unconditionalSelfTransitionNotFirstNoAssign' },
        { messageId: 'conditionalSelfTransitionNoAssign' },
      ],
    }),
    withVersion(4, {
      code: `
        createMachine({
          states: {
            deciding: {
              always: [
                {
                  cond: () => {},
                  target: 'deciding',
                  actions: assign({}),
                },
              ],
            },
          },
        })
      `,
      errors: [
        {
          messageId: 'firstConditionalSelfTransitionAndGuardNotCheckingContext',
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
                  guard: ({ event }) => event.type === 'EVENT',
                  target: 'deciding',
                  actions: assign({}),
                },
              ],
            },
          },
        })
      `,
      errors: [
        {
          messageId: 'firstConditionalSelfTransitionAndGuardNotCheckingContext',
        },
      ],
    }),
    // potential loops or useless
    withVersion(4, {
      code: `
        createMachine({
          states: {
            deciding: {
              always: [
                {
                  cond: () => {},
                  actions: assign({ count: 1 }),
                },
                {
                  cond: () => {},
                  actions: () => {},
                },
              ],
            },
          },
        })
      `,
      errors: [
        { messageId: 'noTargetAndGuardNotCheckingContextIsFirst' },
        { messageId: 'noTargetHasGuardNoAssign' },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            deciding: {
              always: [
                {
                  guard: ({ event }) => event.type === 'EVENT',
                  actions: assign({ count: 1 }),
                },
                {
                  guard: () => {},
                  actions: () => {},
                },
              ],
            },
          },
        })
      `,
      errors: [
        { messageId: 'noTargetAndGuardNotCheckingContextIsFirst' },
        { messageId: 'noTargetHasGuardNoAssign' },
      ],
    }),
    // outside of createMachine it is not linted by default
    withVersion(4, {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            deciding: {
              always: {},
            },
          },
        }
      `,
      errors: [{ messageId: 'noTargetNoGuardIsSingle' }],
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-infinite-loop', rule, tests)
