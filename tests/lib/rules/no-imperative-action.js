const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-imperative-action')
const { withVersion } = require('../utils/settings')

const tests = {
  valid: [
    withVersion(
      4,
      `
      createMachine({
        states: {
          active: {
            entry: assign({}),
            exit: [
              assign(),
              cancel(),
              choose(),
              done(),
              doneInvoke(),
              error(),
              escalate(),
              forwardTo(),
              log(),
              pure(),
              raise(),
              respond(),
              send(),
              sendParent(),
              sendTo(),
              sendUpdate(),
              start(),
              stop(),
            ],
            on: {
              TRIGGER1: {
                actions: assign(),
              },
              TRIGGER2: {
                actions: [
                  assign(),
                  send(),
                  sendParent(),
                ],
              },
            },
          },
        },
      })
    `
    ),
    withVersion(
      5,
      `
      createMachine({
        states: {
          active: {
            entry: assign({}),
            exit: [
              assign(),
              cancel(),
              choose(),
              done(),
              doneInvoke(),
              error(),
              escalate(),
              forwardTo(),
              log(),
              pure(),
              raise(),
              sendParent(),
              sendTo(),
              stop(),
            ],
            on: {
              TRIGGER1: {
                actions: assign(),
              },
              TRIGGER2: {
                actions: [
                  assign(),
                  sendTo(),
                  sendParent(),
                  pure(),
                ],
              },
            },
          },
        },
      })
    `
    ),
    withVersion(
      4,
      `
      createMachine(
        {},
        {
          actions: {
            myAction1: assign(),
            myAction2: send(),
            myAction3: sendParent(),
            myAction4: respond(),
            myAction5: raise(),
            myAction6: pure(),
            myAction7: actions.pure(),
          },
        }
      )
    `
    ),
    withVersion(
      5,
      `
      createMachine(
        {},
        {
          actions: {
            myAction1: assign(),
            myAction2: sendTo(),
            myAction3: sendParent(),
            myAction4: raise(),
            myAction5: pure(),
            myAction6: actions.pure(),
          },
        }
      )
    `
    ),
  ],
  invalid: [
    withVersion(4, {
      code: `
        createMachine({
          states: {
            active: {
              entry: () => assign(),
              exit: [
                () => {
                  assign()
                },
                function() {
                  assign()
                },
                () => send(),
                () => actions.send(),
                () => sendParent(),
                () => respond(),
                () => raise(),
                () => forwardTo(),
                () => choose(),
                () => pure(),
                () => log(),
              ],
              on: {
                TRIGGER1: {
                  actions: () => assign(),
                },
                TRIGGER2: {
                  actions: function() { assign() },
                },
                TRIGGER3: {
                  actions: [
                    () => assign(),
                    () => { assign() },
                    function() { assign() },
                  ],
                },
              },
            },
          },
        })
      `,
      errors: [
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'send' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'actions.send' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'sendParent' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'respond' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'raise' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'forwardTo' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'choose' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'pure' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'log' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine({
          states: {
            active: {
              entry: () => assign(),
              exit: [
                () => {
                  assign()
                },
                function() {
                  assign()
                },
                () => sendTo(),
                () => actions.sendTo(),
                () => sendParent(),
                () => forwardTo(),
                () => raise(),
                () => choose(),
                () => pure(),
                () => log(),
              ],
              on: {
                TRIGGER1: {
                  actions: () => assign(),
                },
                TRIGGER2: {
                  actions: function() { assign() },
                },
                TRIGGER3: {
                  actions: [
                    () => assign(),
                    () => { assign() },
                    function() { assign() },
                  ],
                },
              },
            },
          },
        })
      `,
      errors: [
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'sendTo' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'actions.sendTo' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'sendParent' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'forwardTo' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'raise' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'choose' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'pure' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'log' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
      ],
    }),
    withVersion(4, {
      code: `
        createMachine(
          {},
          {
            actions: {
              myAction1: () => assign(),
              myAction2: () => { send() },
              myAction3: function() { sendParent() },
              myAction4: () => respond(),
              myAction5: () => raise(),
            },
          }
        )
      `,
      errors: [
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'send' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'sendParent' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'respond' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'raise' },
        },
      ],
    }),
    withVersion(5, {
      code: `
        createMachine(
          {},
          {
            actions: {
              myAction1: () => assign(),
              myAction2: () => { sendTo() },
              myAction3: function() { sendParent() },
              myAction4: () => choose(),
              myAction5: () => raise(),
            },
          }
        )
      `,
      errors: [
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'assign' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'sendTo' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'sendParent' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'choose' },
        },
        {
          messageId: 'imperativeActionCreator',
          data: { actionCreator: 'raise' },
        },
      ],
    }),
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-imperative-action', rule, tests)
