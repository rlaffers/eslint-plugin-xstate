const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/spawn-usage')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    // not imported from xstate - ignore the rule
    withVersion(
      4,
      `
      spawn(x)
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign({
        ref: () => spawn(x)
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign({
        ref: () => spawn(x)
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign({
        ref: () => spawn(x)
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign(() => ({
        ref: spawn(x, 'id')
      }))
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign(() => {
        return {
          ref: spawn(x)
        }
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign(() => {
        const ref = spawn(x)
        return {
          ref,
        }
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign(() => {
        const start = () => spawn(x)
        return {
          ref: start()
        }
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign({
        ref: function() { return spawn(x) }
      })
    `
    ),
    withVersion(
      4,
      `
      import { spawn } from 'xstate'
      assign(function() {
        return {
          ref: spawn(x, 'id')
        }
      })
    `
    ),
    // other import types
    withVersion(
      4,
      `
      import { spawn as foo } from 'xstate'
      assign({
        ref: () => foo(x)
      })
    `
    ),
    withVersion(
      4,
      `
      import xs from 'xstate'
      const { spawn } = xs
      const foo = xs.spawn

      assign({
        ref1: () => spawn(x),
        ref2: () => foo(x),
        ref3: () => xs.spawn(x),
        ref4: () => xs['spawn'](x),
      })
    `
    ),
    withVersion(
      4,
      `
      import * as xs from 'xstate'
      const { spawn } = xs
      const foo = xs.spawn

      assign({
        ref1: () => spawn(x),
        ref2: () => foo(x),
        ref3: () => xs.spawn(x),
        ref4: () => xs['spawn'](x),
      })
    `
    ),
  ],
  invalid: [
    withVersion(4, {
      code: `
        import { spawn } from 'xstate'
        spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        import { spawn } from 'xstate'
        assign(spawn(x))
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        import { spawn } from 'xstate'
        assign({
          ref: spawn(x)
        })
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        import { spawn } from 'xstate'
        assign((() => ({
          ref: spawn(x)
        }))())
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    // test other import types with a single invalid call
    withVersion(4, {
      code: `
        import { spawn as foo } from 'xstate'
        foo(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        import xs from 'xstate'
        const { spawn } = xs
        const foo = xs.spawn
        const boo = xs['spawn']

        spawn()
        foo(x)
        boo(x)
        xs.spawn(x)
      `,
      errors: [
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
      ],
    }),
    withVersion(4, {
      code: `
        import * as xs from 'xstate'
        const { spawn } = xs
        const foo = xs.spawn
        const boo = xs['spawn']

        spawn()
        foo(x)
        boo()
        xs.spawn(x)
      `,
      errors: [
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
        { messageId: 'invalidCallContext' },
      ],
    }),
    withVersion(4, {
      code: `
        const { spawn } = require('xstate')
        spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        const spawn = require('xstate').spawn
        spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        const spawn = require('xstate')['spawn']
        spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
    withVersion(4, {
      code: `
        const xs = require('xstate')
        xs.spawn(x)
      `,
      errors: [{ messageId: 'invalidCallContext' }],
    }),
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
