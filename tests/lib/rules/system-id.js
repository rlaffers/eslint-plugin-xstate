const { RuleTester } = require('eslint')
const { withVersion } = require('../utils/settings')
const rule = require('../../../lib/rules/system-id')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})

const missingSystemIdInvoke = {
  messageId: 'missingSystemId',
}
const missingSystemIdSpawn = {
  messageId: 'missingSystemIdSpawn',
}
const invalidSystemId = {
  messageId: 'invalidSystemId',
}
const notAllowedIn4 = {
  messageId: 'systemIdNotAllowedBeforeVersion5',
}

ruleTester.run('system-id', rule, {
  valid: [
    withVersion(
      5,
      `
        const machine = createMachine({
          invoke: {
            src: 'someActor',
            systemId: 'someId',
          },
        })
      `
    ),
    withVersion(
      5,
      `
        const machine = createMachine({
          initial: 'idle',
          states: {
            idle: {
              entry: assign({
                ref: ({ spawn }) => spawn('someActor', { systemId: 'actor1' }),
              }),
              exit: assign(({ spawn }) => ({
                ref: spawn('someActor', { systemId: 'actor2' }),
              }))
            },
          },
        })
      `
    ),
  ],
  invalid: [
    withVersion(5, {
      code: `
        const machine = createMachine({
          invoke: {
            src: 'someActor',
          },
        })
      `,
      errors: [missingSystemIdInvoke],
    }),
    withVersion(5, {
      code: `
        const machine = createMachine({
          invoke: {
            src: 'someActor',
            systemId: [],
          },
        })
      `,
      errors: [invalidSystemId],
    }),
    withVersion(4, {
      code: `
        const machine = createMachine({
          invoke: {
            src: 'someActor',
            systemId: 'someId',
          },
        })
      `,
      errors: [notAllowedIn4],
      output: `
        const machine = createMachine({
          invoke: {
            src: 'someActor',
            
          },
        })
      `,
    }),
    withVersion(5, {
      code: `
        const machine = createMachine({
          initial: 'idle',
          states: {
            idle: {
              entry: assign({
                ref: ({ spawn }) => spawn('someActor'),
              }),
              exit: assign(({ spawn }) => ({
                ref: spawn('someActor'),
              })),
            },
          },
        })
      `,
      errors: [missingSystemIdSpawn, missingSystemIdSpawn],
    }),
    withVersion(5, {
      code: `
        const machine = createMachine({
          invoke: {
            src: 'someActor',
            systemId: 'myId',
          },
          entry: assign({
            ref: ({ spawn }) => spawn('someActor', { systemId: 'myId' }),
          }),
        })
      `,
      errors: [
        {
          messageId: 'duplicateSystemId',
          data: {
            systemId: 'myId',
          },
        },
      ],
    }),
  ],
})
