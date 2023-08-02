const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/spawn-usage')

const tests = {
  valid: [
    // not imported from xstate - ignore the rule
    `
      spawn(x)
    `,
    `
      import { spawn } from 'xstate'
      assign({
        ref: () => spawn(x)
      })
    `,
    `
      import { spawn } from 'xstate'
      assign({
        ref: () => spawn(x)
      })
    `,
    `
      import { spawn } from 'xstate'
      assign({
        ref: () => spawn(x)
      })
    `,
    `
      import { spawn } from 'xstate'
      assign(() => ({
        ref: spawn(x, 'id')
      }))
    `,
    `
      import { spawn } from 'xstate'
      assign(() => {
        return {
          ref: spawn(x)
        }
      })
    `,
    `
      import { spawn } from 'xstate'
      assign(() => {
        const ref = spawn(x)
        return {
          ref,
        }
      })
    `,
    `
      import { spawn } from 'xstate'
      assign(() => {
        const start = () => spawn(x)
        return {
          ref: start()
        }
      })
    `,
    `
      import { spawn } from 'xstate'
      assign({
        ref: function() { return spawn(x) }
      })
    `,
    `
      import { spawn } from 'xstate'
      assign(function() {
        return {
          ref: spawn(x, 'id')
        }
      })
    `,
    // other import types
    `
      import { spawn as foo } from 'xstate'
      assign({
        ref: () => foo(x)
      })
    `,
    `
      import xs from 'xstate'
      const { spawn } = xs
      const foo = xs.spawn

      assign({
        ref1: () => spawn(x),
        ref2: () => foo(x),
        ref3: () => xs.spawn(x),
      })
    `,
    `
      import * as xs from 'xstate'
      const { spawn } = xs
      const foo = xs.spawn

      assign({
        ref1: () => spawn(x),
        ref2: () => foo(x),
        ref3: () => xs.spawn(x),
      })
    `,
  ],
  invalid: [
    {
      code: `
        import { spawn } from 'xstate'
        spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        import { spawn } from 'xstate'
        assign(spawn(x))
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        import { spawn } from 'xstate'
        assign({
          ref: spawn(x)
        })
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        import { spawn } from 'xstate'
        assign((() => ({
          ref: spawn(x)
        }))())
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    // test other import types with a single invalid call
    {
      code: `
        import { spawn as foo } from 'xstate'
        foo(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    },
    {
      code: `
        import xs from 'xstate'
        const { spawn } = xs
        const foo = xs.spawn

        spawn()
        foo(x)
        xs.spawn(x)
      `,
      errors: [
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
      ],
    },
    {
      code: `
        import * as xs from 'xstate'
        const { spawn } = xs
        const foo = xs.spawn

        spawn()
        foo(x)
        xs.spawn(x)
      `,
      errors: [
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
      ],
    },
    // {
    //   code: `
    //     import xs from 'xstate'
    //     xs.spawn(x)
    //   `,
    //   errors: [{ messageId: 'invalidCallContext' }],
    // },
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

// const ruleTester = new RuleTester()
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})
ruleTester.run('spawn-usage', rule, tests)
