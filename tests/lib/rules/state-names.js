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
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('state-names', rule, tests)
