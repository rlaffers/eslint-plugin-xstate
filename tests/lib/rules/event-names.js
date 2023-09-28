const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/event-names')

const tests = {
  valid: [
    `
      createMachine({
        on: {
          TOGGLE: 'busy',
          START_WORK: 'busy',
          'MOUSE.CLICK': 'busy',
          'MY_MOUSE.*': 'busy',
          [eventName]: 'busy',
          '*': 'busy',
        },
        entry: [
          send('TOGGLE'),
          respond('START_WORK'),
          sendParent('MOUSE.CLICK'),
          raise('MY_MOUSE.SCROLL_DOWN'),
          send({ type: 'TOGGLE' }),
          sendTo('myActor', 'TOGGLE'),
          sendTo('myActor', { type: 'TOGGLE' }),
          forwardTo('myActor'),
        ],
      })
    `,
    // old Machine creator
    `
      Machine({
        on: {
          TOGGLE: 'busy',
          START_WORK: 'busy',
          'MOUSE.CLICK': 'busy',
          'MY_MOUSE.*': 'busy',
          [eventName]: 'busy',
          '*': 'busy',
        },
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
    `
      /* eslint event-names: [ "warn", "regex", { "regex": "^[a-z]+:[a-z0-9]+$" } ] */
      createMachine({
        on: {
          'power:on': {},
          'click:1': {},
        },
      })
    `,
  ],

  invalid: [
    {
      code: `
        createMachine({
          on: {
            myEvent: 'busy',
            my_event: 'busy',
            'My Event': 'busy',
            'myEvent.*': 'busy',
          },
          entry: [
            send('myEvent'),
            sendParent('my_event'),
            respond('My Event'),
            raise('myEvent.click'),
            send({ type: 'myEvent' }),
            sendTo('myActor', 'myEvent2'),
            sendTo('myActor', { type: 'myEvent3' }),
          ],
        })
      `,
      errors: [
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'My Event', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent.*', fixedEventName: 'MY_EVENT.*' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'My Event', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: {
            eventName: 'myEvent.click',
            fixedEventName: 'MY_EVENT.CLICK',
          },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent', fixedEventName: 'MY_EVENT' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent2', fixedEventName: 'MY_EVENT_2' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent3', fixedEventName: 'MY_EVENT_3' },
        },
      ],
      output: `
        createMachine({
          on: {
            MY_EVENT: 'busy',
            MY_EVENT: 'busy',
            MY_EVENT: 'busy',
            'MY_EVENT.*': 'busy',
          },
          entry: [
            send('MY_EVENT'),
            sendParent('MY_EVENT'),
            respond('MY_EVENT'),
            raise('MY_EVENT.CLICK'),
            send({ type: 'MY_EVENT' }),
            sendTo('myActor', 'MY_EVENT_2'),
            sendTo('myActor', { type: 'MY_EVENT_3' }),
          ],
        })
      `,
    },
    // snake_case
    {
      code: `
        /* eslint event-names: [ "warn", "snakeCase" ] */
        createMachine({
          on: {
            myEvent: 'busy',
            MY_EVENT: 'busy',
            'My Event': 'busy',
            'myEvent.*': 'busy',
          },
          entry: [
            send('myEvent'),
            sendParent('MY_EVENT'),
            respond('My Event'),
            raise('myEvent.click'),
            send({ type: 'myEvent' }),
            sendTo('myActor', 'myEvent2'),
            sendTo('myActor', { type: 'myEvent3' }),
          ],
        })
      `,
      errors: [
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'MY_EVENT', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'My Event', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent.*', fixedEventName: 'my_event.*' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'MY_EVENT', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'My Event', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: {
            eventName: 'myEvent.click',
            fixedEventName: 'my_event.click',
          },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent', fixedEventName: 'my_event' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent2', fixedEventName: 'my_event_2' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'myEvent3', fixedEventName: 'my_event_3' },
        },
      ],
      output: `
        /* eslint event-names: [ "warn", "snakeCase" ] */
        createMachine({
          on: {
            my_event: 'busy',
            my_event: 'busy',
            my_event: 'busy',
            'my_event.*': 'busy',
          },
          entry: [
            send('my_event'),
            sendParent('my_event'),
            respond('my_event'),
            raise('my_event.click'),
            send({ type: 'my_event' }),
            sendTo('myActor', 'my_event_2'),
            sendTo('myActor', { type: 'my_event_3' }),
          ],
        })
      `,
    },
    // camelCase
    {
      code: `
        /* eslint event-names: [ "warn", "camelCase" ] */
        createMachine({
          on: {
            my_event: 'busy',
            MY_EVENT: 'busy',
            'My Event': 'busy',
            'my_event.*': 'busy',
          },
          entry: [
            send('my_event'),
            sendParent('MY_EVENT'),
            respond('My Event'),
            raise('my_event.click'),
            send({ type: 'my_event' }),
            sendTo('myActor', 'my_event_2'),
            sendTo('myActor', { type: 'my_event_3' }),
          ],
        })
      `,
      errors: [
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'MY_EVENT', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'My Event', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event.*', fixedEventName: 'myEvent.*' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'MY_EVENT', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'My Event', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: {
            eventName: 'my_event.click',
            fixedEventName: 'myEvent.click',
          },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event', fixedEventName: 'myEvent' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event_2', fixedEventName: 'myEvent2' },
        },
        {
          messageId: 'invalidEventName',
          data: { eventName: 'my_event_3', fixedEventName: 'myEvent3' },
        },
      ],
      output: `
        /* eslint event-names: [ "warn", "camelCase" ] */
        createMachine({
          on: {
            myEvent: 'busy',
            myEvent: 'busy',
            myEvent: 'busy',
            'myEvent.*': 'busy',
          },
          entry: [
            send('myEvent'),
            sendParent('myEvent'),
            respond('myEvent'),
            raise('myEvent.click'),
            send({ type: 'myEvent' }),
            sendTo('myActor', 'myEvent2'),
            sendTo('myActor', { type: 'myEvent3' }),
          ],
        })
      `,
    },
    // sending events with wildcards
    {
      code: `
        createMachine({
          entry: [
            send('EVENT.*'),
            sendParent('EVENT.CLICK.*'),
            respond('*'),
            raise('EVENT.*'),
            send({ type: 'EVENT.*' }),
            sendTo('myActor', 'EVENT.*'),
            sendTo('myActor', { type: 'EVENT.*' }),
          ],
        })
      `,
      errors: [
        {
          messageId: 'invalidSendEventName',
        },
        {
          messageId: 'invalidSendEventName',
        },
        {
          messageId: 'invalidSendEventName',
        },
        {
          messageId: 'invalidSendEventName',
        },
        {
          messageId: 'invalidSendEventName',
        },
        {
          messageId: 'invalidSendEventName',
        },
        {
          messageId: 'invalidSendEventName',
        },
      ],
    },
    {
      code: `
        /* eslint event-names: [ "warn", "regex", { "regex": "^[a-z]+:[a-z0-9]+$" } ] */
        createMachine({
          on: {
            PowerOn: {},
            power_on: {},
          },
        })
      `,
      errors: [
        {
          messageId: 'eventNameViolatesRegex',
          data: { eventName: 'PowerOn', regex: '^[a-z]+:[a-z0-9]+$' },
        },
        {
          messageId: 'eventNameViolatesRegex',
          data: { eventName: 'power_on', regex: '^[a-z]+:[a-z0-9]+$' },
        },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('event-names', rule, tests)
