const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-infinite-loop')

const tests = {
  valid: [
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
    `,
    // unconditional assign actions if they are not first
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
    `,
    // conditional assign actions
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
    `,
    // conditional self transition with assign action
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
    `,
    // unconditional self transition with assign actions if they are not first
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
    `,
  ],
  invalid: [
    {
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
    },
    {
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
    },
    // self transitions
    {
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
    },
    {
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
    },
    // potential loops or useless
    {
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
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-infnite-loop', rule, tests)
