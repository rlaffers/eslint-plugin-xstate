const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/prefer-always')

const tests = {
  valid: [
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
    `,
  ],
  invalid: [
    {
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
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('prefer-always', rule, tests)
