const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/state-names')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          powerOn: {},
          powerOff: {},
        },
      })
    `,
    `
      /* eslint state-names: [ "warn", "snakeCase" ] */
      createMachine({
        states: {
          power_on: {},
          active: {},
        },
      })
    `,
    `
      /* eslint state-names: [ "warn", "regex", { "regex": "^[a-z]+:[a-z0-9]+$" } ] */
      createMachine({
        states: {
          'power:on': {},
          'mode:1': {},
        },
      })
    `,
    `
      createMachine({
        id: 'root',
        states: {
          powerOn: {
            on: {
              EVENT1: 'powerOff',
              EVENT2: {
                target: 'powerOff',
              },
              EVENT3: '#root.powerOff',
              EVENT4: '.highPower',
            },
          },
          powerOff: {
            invoke: {
              src: 'myService',
              onDone: 'powerOff',
              onError: {
                target: 'powerOff',
              },
            },
          },
        },
      })
    `,
    // no errors outside of createMachine by default
    `
      const config = {
        states: {
          PowerOn: {},
          power_on: {},
          'power:on': {},
          'power.on': {},
          entry: {},
        },
        onDone: 'power_on',
        on: {
          CLICK: 'power_on',
          BUMP: {
            target: 'power_on',
          }
        }
      }
    `,
  ],

  invalid: [
    {
      code: `
        createMachine({
          states: {
            PowerOn: {},
            power_on: {},
            'power:on': {},
            'power.on': {},
          },
        })
      `,
      errors: [
        {
          messageId: 'invalidStateName',
          data: { name: 'PowerOn', fixedName: 'powerOn' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power_on', fixedName: 'powerOn' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power:on', fixedName: 'powerOn' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power.on', fixedName: 'powerOn' },
        },
      ],
      output: `
        createMachine({
          states: {
            powerOn: {},
            powerOn: {},
            powerOn: {},
            powerOn: {},
          },
        })
      `,
    },
    // snake_case
    {
      code: `
        /* eslint state-names: [ "warn", "snakeCase" ] */
        createMachine({
          states: {
            PowerOn: {},
            POWER___ON: {},
            'power:on': {},
            'power.on': {},
          },
        })
      `,
      errors: [
        {
          messageId: 'invalidStateName',
          data: { name: 'PowerOn', fixedName: 'power_on' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'POWER___ON', fixedName: 'power_on' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power:on', fixedName: 'power_on' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power.on', fixedName: 'power_on' },
        },
      ],
      output: `
        /* eslint state-names: [ "warn", "snakeCase" ] */
        createMachine({
          states: {
            power_on: {},
            power_on: {},
            power_on: {},
            power_on: {},
          },
        })
      `,
    },
    {
      code: `
        /* eslint state-names: [ "warn", "regex", { "regex": "^[a-z]+:[a-z0-9]+$" } ] */
        createMachine({
          states: {
            PowerOn: {},
            power_on: {},
          },
        })
      `,
      errors: [
        {
          messageId: 'stateNameViolatesRegex',
          data: { name: 'PowerOn', regex: '^[a-z]+:[a-z0-9]+$' },
        },
        {
          messageId: 'stateNameViolatesRegex',
          data: { name: 'power_on', regex: '^[a-z]+:[a-z0-9]+$' },
        },
      ],
    },
    // special words used as state names
    {
      code: `
        /* eslint state-names: [ "warn", "camelCase" ] */
        createMachine({
          states: {
            src: {},
            entry: {},
            'invoke': {},
            'actions': {},
          },
        })
      `,
      errors: [
        {
          messageId: 'stateNameIsReservedWord',
          data: { name: 'src' },
        },
        {
          messageId: 'stateNameIsReservedWord',
          data: { name: 'entry' },
        },
        {
          messageId: 'stateNameIsReservedWord',
          data: { name: 'invoke' },
        },
        {
          messageId: 'stateNameIsReservedWord',
          data: { name: 'actions' },
        },
      ],
    },
    // validate state names in target positions
    {
      code: `
        /* eslint state-names: [ "warn", "camelCase" ] */
        createMachine({
          id: 'root',
          states: {
            powerOn: {
              on: {
                EVENT1: 'PowerOff',
                EVENT2: {
                  target: 'power_off',
                },
                EVENT3: '#root.power_off',
                EVENT4: '.HIGH_POWER',
              },
            },
            powerOff: {
              invoke: {
                src: 'myService',
                onDone: 'power off',
                onError: {
                  target: 'POWER:OFF',
                },
              },
            },
          },
        })
      `,
      errors: [
        {
          messageId: 'invalidStateName',
          data: { name: 'PowerOff', fixedName: 'powerOff' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power_off', fixedName: 'powerOff' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: '#root.power_off', fixedName: '#root.powerOff' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: '.HIGH_POWER', fixedName: '.highPower' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power off', fixedName: 'powerOff' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'POWER:OFF', fixedName: 'powerOff' },
        },
      ],
      output: `
        /* eslint state-names: [ "warn", "camelCase" ] */
        createMachine({
          id: 'root',
          states: {
            powerOn: {
              on: {
                EVENT1: 'powerOff',
                EVENT2: {
                  target: 'powerOff',
                },
                EVENT3: '#root.powerOff',
                EVENT4: '.highPower',
              },
            },
            powerOff: {
              invoke: {
                src: 'myService',
                onDone: 'powerOff',
                onError: {
                  target: 'powerOff',
                },
              },
            },
          },
        })
      `,
    },
    // report errors outside of createMachine if there is the comment directive
    {
      code: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            PowerOn: {},
            power_on: {},
            'power:on': {},
            'power.on': {},
            entry: {},
            someState: {
              on: {
                CLICK: 'power_shut',
                BUMP: {
                  target: 'power_kill',
                },
              },
            },
          },
          onDone: 'power_off',
        }
      `,
      errors: [
        {
          messageId: 'invalidStateName',
          data: { name: 'PowerOn', fixedName: 'powerOn' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power_on', fixedName: 'powerOn' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power:on', fixedName: 'powerOn' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power.on', fixedName: 'powerOn' },
        },
        {
          messageId: 'stateNameIsReservedWord',
          data: { name: 'entry' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power_shut', fixedName: 'powerShut' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power_kill', fixedName: 'powerKill' },
        },
        {
          messageId: 'invalidStateName',
          data: { name: 'power_off', fixedName: 'powerOff' },
        },
      ],
      output: `
        /* eslint-plugin-xstate-include */
        const config = {
          states: {
            powerOn: {},
            powerOn: {},
            powerOn: {},
            powerOn: {},
            entry: {},
            someState: {
              on: {
                CLICK: 'powerShut',
                BUMP: {
                  target: 'powerKill',
                },
              },
            },
          },
          onDone: 'powerOff',
        }
      `,
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('state-names', rule, tests)
