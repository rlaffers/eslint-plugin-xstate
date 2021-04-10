const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/spawn-usage')

const tests = {
  valid: [
    `
      assign({
        ref: () => spawn(x)
      })
    `,
    `
      assign(() => ({
        ref: spawn(x, 'id')
      }))
    `,
    `
      assign(() => {
        return {
          ref: spawn(x)
        }
      })
    `,
    `
      assign(() => {
        const ref = spawn(x)
        return {
          ref,
        }
      })
    `,
    `
      assign(() => {
        const start = () => spawn(x)
        return {
          ref: start()
        }
      })
    `,
    `
      assign({
        ref: function() { return spawn(x) }
      })
    `,
    `
      assign(function() {
        return {
          ref: spawn(x, 'id')
        }
      })
    `,
  ],
  invalid: [
    {
      code: `
        spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        assign(spawn(x))
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        assign({
          ref: spawn(x)
        })
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        assign((() => ({
          ref: spawn(x)
        }))())
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    // TODO extend the rule to catch this use case
    // {
    //   code: `
    //     assign(() => {
    //       const start = () => spawn(x)
    //       return {
    //         ref: start
    //       }
    //     })
    //   `,
    //   errors: [{ messageId: 'spawnNeverCalled' }],
    // },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('spawn-usage', rule, tests)
