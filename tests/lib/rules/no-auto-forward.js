const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-auto-forward')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
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
    `
    ),
    withVersion(
      4,
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
    `
    ),
  ],
  invalid: [
    withVersion(4, {
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
    }),
    withVersion(5, {
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
      errors: [{ messageId: 'autoForwardDeprecated' }],
    }),
    withVersion(4, {
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
    }),
    withVersion(5, {
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
      errors: [{ messageId: 'autoForwardDeprecated' }],
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-auto-forward', rule, tests)
