const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-invalid-state-props')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        context: {}, // valid in the root node
        initial: 'idle',
        strict: true,
        preserveActionOrder: true,
        predictableActionArguments: true,
        description: 'This is my root node',
        schema: {
          context: {},
          events: {},
        },
        tsTypes: {},
        entry: 'log',
        exit: 'log',
        states: {
          idle: {
            type: 'parallel',
            entry: 'log',
            exit: 'log',
            always: [],
            after: {},
            states: {},
            onDone: {},
            on: {},
            tags: ['off'],
            invoke: { src: 'someService' },
            description: 'this is an idle state',
            activities: ['beeping']
          },
          busy: {
            type: 'compound',
            initial: 'reading',
            states: {
              hist: {
                type: 'history',
                history: 'deep',
                target: 'writing',
              },
              reading: {
                meta: {
                  value: 42,
                },
              },
              writing: {},
            },
          },
          done: {
            type: 'final',
            data: {},
          },
        },
      })
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        context: {}, // valid in the root node
        initial: 'idle',
        description: 'This is my root node',
        types: {},
        entry: 'log',
        exit: 'log',
        output: { answer: 42 },
        states: {
          idle: {
            type: 'parallel',
            entry: 'log',
            exit: 'log',
            always: [],
            after: {},
            states: {},
            onDone: {},
            on: {},
            tags: ['off'],
            invoke: { src: 'someService' },
            description: 'this is an idle state'
          },
          busy: {
            type: 'compound',
            initial: 'reading',
            states: {
              hist: {
                type: 'history',
                history: 'deep',
                target: 'writing',
              },
              reading: {
                meta: {
                  value: 42,
                },
              },
              writing: {},
            },
          },
          done: {
            type: 'final',
            output: {},
          },
        },
      })
    `
    ),
    // no errors reported outside of createMachine by default
    withVersion(
      4,
      `
      const config = {
        id: 'myMachine',
        context: {},
        foo: '???',
        states: {
          idle: {
            foo: '???',
          },
        },
      }
      `
    ),
    withVersion(
      5,
      `
      const config = {
        id: 'myMachine',
        context: {},
        foo: '???',
        states: {
          idle: {
            foo: '???',
          },
        },
      }
      `
    ),
  ],
  invalid: [
    // unrecognized prop names
    withVersion(4, {
      code: `
        createMachine({
          intial: 'idle',
          states: {
            idle: {
              id: 'idle-state',
              enter: 'log',
            },
          },
        })
      `,
      errors: [
        { messageId: 'invalidRootStateProperty', data: { propName: 'intial' } },
        { messageId: 'invalidStateProperty', data: { propName: 'enter' } },
      ],
    }),
    // unrecognized prop names
    withVersion(5, {
      code: `
        createMachine({
          intial: 'idle',
          strict: true,
          preserveActionOrder: true,
          predictableActionArguments: true,
          schema: {
            context: {},
            events: {},
          },
          tsTypes: {},
          states: {
            idle: {
              id: 'idle-state',
              enter: 'log',
              activities: ['beeping'],
            },
            finished: {
              type: 'final',
              data: {},
            },
          },
        })
      `,
      errors: [
        { messageId: 'invalidRootStateProperty', data: { propName: 'intial' } },
        { messageId: 'invalidRootStateProperty', data: { propName: 'strict' } },
        {
          messageId: 'invalidRootStateProperty',
          data: { propName: 'preserveActionOrder' },
        },
        {
          messageId: 'invalidRootStateProperty',
          data: { propName: 'predictableActionArguments' },
        },
        { messageId: 'invalidRootStateProperty', data: { propName: 'schema' } },
        {
          messageId: 'invalidRootStateProperty',
          data: { propName: 'tsTypes' },
        },
        { messageId: 'invalidStateProperty', data: { propName: 'enter' } },
        { messageId: 'invalidStateProperty', data: { propName: 'activities' } },
        { messageId: 'invalidStateProperty', data: { propName: 'data' } },
      ],
    }),
    // certain props are valid only in specific contexts
    withVersion(4, {
      code: `
        createMachine({
          initial: 'idle',
          type: 'parallel',
          states: {
            idle: {
              type: 'atomic',
              initial: 'sleeping',
              context: {},
            },
            reversed: {
              history: 'shallow',
              target: 'idle',
            },
          },
        })
      `,
      errors: [
        { messageId: 'initialAllowedOnlyOnCompoundNodes' },
        { messageId: 'initialAllowedOnlyOnCompoundNodes' },
        { messageId: 'contextAllowedOnlyOnRootNodes' },
        {
          messageId: 'propAllowedOnHistoryStateOnly',
          data: { propName: 'history' },
        },
        {
          messageId: 'propAllowedOnHistoryStateOnly',
          data: { propName: 'target' },
        },
      ],
    }),
    // some recognized props cannot be on the root node
    withVersion(4, {
      code: `
        createMachine({
          onDone: 'idle',
          states: {
            idle: {},
          },
        })
      `,
      errors: [
        { messageId: 'invalidRootStateProperty', data: { propName: 'onDone' } },
      ],
    }),
    // invalid type values
    // invalid history values
    withVersion(4, {
      code: `
        createMachine({
          states: {
            idle: {
              type: 'paralel',
            },
            finished: {
              type: 'done',
            },
            hist: {
              type: 'history',
              history: 'shallowish',
            },
          },
        })
      `,
      errors: [
        { messageId: 'invalidTypeValue', data: { value: 'paralel' } },
        { messageId: 'invalidTypeValue', data: { value: 'done' } },
        { messageId: 'invalidHistoryValue', data: { value: 'shallowish' } },
      ],
    }),
    // should report errors outside of createMachine if there is the comment directive
    withVersion(4, {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          id: 'myMachine',
          context: {
            simpson: 10,
          },
          foo: '???',
          states: {
            idle: {
              boo: '???',
            },
          },
        }
      `,
      errors: [
        { messageId: 'invalidRootStateProperty', data: { propName: 'foo' } },
        { messageId: 'invalidStateProperty', data: { propName: 'boo' } },
      ],
    }),
    withVersion(5, {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          id: 'myMachine',
          context: {
            simpson: 10,
          },
          foo: '???',
          states: {
            idle: {
              boo: '???',
            },
          },
        }
      `,
      errors: [
        { messageId: 'invalidRootStateProperty', data: { propName: 'foo' } },
        { messageId: 'invalidStateProperty', data: { propName: 'boo' } },
      ],
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-invalid-state-props', rule, tests)
