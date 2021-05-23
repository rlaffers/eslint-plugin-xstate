const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-invalid-state-props')

const tests = {
  valid: [
    `
      createMachine({
        context: {}, // valid in the root node
        initial: 'idle',
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
        },
      })
    `,
  ],
  invalid: [
    // unrecognized prop names
    {
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
    },
    // certain props are valid only in specific contexts
    {
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
    },
    // some recognized props cannot be on the root node
    {
      code: `
        createMachine({
          exit: 'someAction',
          onDone: 'idle',
          states: {
            idle: {},
          },
        })
      `,
      errors: [
        { messageId: 'invalidRootStateProperty', data: { propName: 'exit' } },
        { messageId: 'invalidRootStateProperty', data: { propName: 'onDone' } },
      ],
    },
    // invalid type values
    // invalid history values
    {
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
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-invalid-state-props', rule, tests)
