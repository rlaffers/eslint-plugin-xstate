const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/invoke-usage')

const tests = {
  valid: [
    `
      createMachine({
        initial: 'active',
        states: {
          active: {
            invoke: {
              src: () => {},
            },
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'active',
        states: {
          active: {
            invoke: {
              src: 'someService',
            },
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'active',
        states: {
          active: {
            invoke: {
              src: someService,
            },
          },
        },
      })
    `,
    `
      createMachine({
        initial: 'active',
        states: {
          active: {
            invoke: [
              {
                src: () => [],
              },
              {
                src: 'someService',
              },
              {
                src: someService,
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
          initial: 'active',
          states: {
            active: {
              invoke: () => {},
            },
            inactive: {
              invoke: 'someService',
            },
            started: {
              invoke: {
                onDone: 'stopped',
              },
            },
            stopped: {
              invoke: {
                src: true,
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'invokeIsNotObject' },
        { messageId: 'invokeIsNotObject' },
        { messageId: 'invokeObjectLacksSrc' },
        { messageId: 'srcPropertyIsInvalid' },
      ],
    },
    {
      code: `
        createMachine({
          initial: 'active',
          states: {
            active: {
              invoke: [
                () => {},
                'someService',
                {
                  onDone: 'stopped',
                },
                {
                  src: true,
                }
              ]
            },
          },
        })
      `,
      errors: [
        { messageId: 'invokeIsNotObject' },
        { messageId: 'invokeIsNotObject' },
        { messageId: 'invokeObjectLacksSrc' },
        { messageId: 'srcPropertyIsInvalid' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('invoke-usage', rule, tests)
