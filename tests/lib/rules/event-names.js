const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/event-names')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          idle: {
            on: {
              TOGGLE: 'busy',
              START_WORK_1: 'busy',
              'RUN': 'busy',
              '*': 'busy',
              // dynamic keys are always valid
              [eventName]: 'busy'
            }
          },
        }
      })
    `,
    // global transitions
    `
      createMachine({
        on: {
          TOGGLE: 'busy',
          START_WORK_1: 'busy',
          'RUN': 'busy',
          '*': 'busy',
          [eventName]: 'busy'
        }
      })
    `,
    // old Machine creator
    `
      Machine({
        on: {
          TOGGLE: 'busy',
          START_WORK_1: 'busy',
          'RUN': 'busy',
          '*': 'busy',
          [eventName]: 'busy'
        }
      })
    `,
    // malformed keys outside of machine declaration are not considered event names
    `
      const obj = {
        on: {
          thisIsNotEvent: 'foo',
          'neither.is.this': 'foo',
        }
      }
    `,
  ],

  invalid: [
    {
      code: `
        createMachine({
          on: {
            badEventName: 'busy',
            poor_name1: 'busy',
            'Malformed Event.name1%$#': 'busy'
          }
        })
      `,
      errors: [
        {
          messageId: 'invalidEventName',
          data: { eventName: 'badEventName', fixedEventName: 'BAD_EVENT_NAME' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'poor_name1', fixedEventName: 'POOR_NAME_1' },
        },
        {
          messageId: 'invalidEventName',
          data: {
            eventName: 'Malformed Event.name1%$#',
            fixedEventName: 'MALFORMED_EVENT_NAME_1',
          },
        },
      ],
      output: `
        createMachine({
          on: {
            BAD_EVENT_NAME: 'busy',
            POOR_NAME_1: 'busy',
            MALFORMED_EVENT_NAME_1: 'busy'
          }
        })
      `,
    },
    // old Machine creator
    {
      code: `
        Machine({
          on: {
            badEventName: 'busy',
            poor_name1: 'busy',
            'Malformed Event.name1%$#': 'busy'
          }
        })
      `,
      errors: [
        {
          messageId: 'invalidEventName',
          data: { eventName: 'badEventName', fixedEventName: 'BAD_EVENT_NAME' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'poor_name1', fixedEventName: 'POOR_NAME_1' },
        },
        {
          messageId: 'invalidEventName',
          data: {
            eventName: 'Malformed Event.name1%$#',
            fixedEventName: 'MALFORMED_EVENT_NAME_1',
          },
        },
      ],
      output: `
        Machine({
          on: {
            BAD_EVENT_NAME: 'busy',
            POOR_NAME_1: 'busy',
            MALFORMED_EVENT_NAME_1: 'busy'
          }
        })
      `,
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('event-names', rule, tests)
