const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-auto-forward')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          playing: {
            invoke: {
              src: 'game',
            },
          },
        },
      })
    `,
    `
      createMachine({
        states: {
          initializing: {
            entry: assign({
              gameRef: () => spawn(game, { autoForward: false }),
            }),
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
            playing: {
              invoke: {
                src: 'game',
                autoForward: true,
              },
            },
          },
        })
      `,
      errors: [{ messageId: 'noAutoForward' }],
    },
    {
      code: `
        createMachine({
          states: {
            initializing: {
              entry: assign({
                gameRef: () => spawn(game, { autoForward: true }),
              }),
            },
          },
        })
      `,
      errors: [{ messageId: 'noAutoForward' }],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-auto-forward', rule, tests)
