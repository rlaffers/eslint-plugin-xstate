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
