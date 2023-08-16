const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/prefer-always')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        states: {
          playing: {
            always: [
              { target: 'win', cond: 'didPlayerWin' },
              { target: 'lose', cond: 'didPlayerLose' },
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
          playing: {
            always: [
              { target: 'win', cond: 'didPlayerWin' },
              { target: 'lose', cond: 'didPlayerLose' },
            ],
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
              on: {
                '': [
                  { target: 'win', cond: 'didPlayerWin' },
                  { target: 'lose', cond: 'didPlayerLose' },
                ],
              },
            },
          },
        })
      `,
      errors: [{ messageId: 'preferAlways' }],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            playing: {
              on: {
                '': [
                  { target: 'win', cond: 'didPlayerWin' },
                  { target: 'lose', cond: 'didPlayerLose' },
                ],
              },
            },
          },
        })
      `,
      errors: [{ messageId: 'eventlessTransitionsDeprecated' }],
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('prefer-always', rule, tests)
