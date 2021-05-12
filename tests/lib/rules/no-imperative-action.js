const RuleTester = require('eslint').RuleTester
const rule = require('../../../lib/rules/no-imperative-action')

const tests = {
  valid: [
    `
      createMachine({
        states: {
          active: {
            entry: assign({}),
            exit: [
              assign({}),
              send('EVENT'),
              sendParent('EVENT'),
              respond('EVENT'),
              raise('EVENT'),
              forwardTo('someActor'),
              choose([]),
              pure(() => {}),
              log('message'),
              escalate('error'),
              pure(() => send('EVENT')),
              actions.pure(() => send('EVENT')),
              pure(() => actions.send('EVENT')),
            ],
            on: {
              TRIGGER1: {
                actions: assign({}),
              },
              TRIGGER2: {
                actions: [
                  assign({}),
                  send(['EVENT']),
                  sendParent('EVENT'),
                  pure(() => send('EVENT')),
                  actions.pure(() => send('EVENT')),
                  pure(() => actions.send('EVENT')),
                ],
              },
            },
          },
        },
      })
    `,
    `
      createMachine(
        {},
        {
          actions: {
            myAction1: assign({}),
            myAction2: send('EVENT'),
            myAction3: sendParent('EVENT'),
            myAction4: respond('EVENT'),
            myAction5: raise('EVENT'),
            myAction6: pure(() => send('EVENT')),
            myAction6: actions.pure(() => send('EVENT')),
          },
        }
      )
    `,
  ],
  invalid: [
    {
      code: `
        createMachine({
          states: {
            active: {
              entry: () => assign({}),
              exit: [
                () => {
                  assign({})
                },
                function() {
                  send('EVENT')
                },
                () => actions.send('EVENT'),
                () => sendParent('EVENT'),
                () => respond('EVENT'),
                () => raise('EVENT'),
                () => forwardTo('someActor'),
                () => choose([]),
                () => pure(() => {}),
                () => log('message'),
                () => escalate('error'),
              ],
              on: {
                TRIGGER1: {
                  actions: () => assign({}),
                },
                TRIGGER2: {
                  actions: function() { assign({}) },
                },
                TRIGGER3: {
                  actions: [
                    () => assign({}),
                    () => { send(['EVENT']) },
                    function() { sendParent(['EVENT']) },
                  ],
                },
              },
            },
          },
        })
      `,
      errors: [
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
      ],
    },
    {
      code: `
        createMachine(
          {},
          {
            actions: {
              myAction1: () => assign({}),
              myAction2: () => { send('EVENT') },
              myAction3: function() { sendParent('EVENT') },
              myAction4: () => respond('EVENT'),
              myAction5: () => raise('EVENT'),
            },
          }
        )
      `,
      errors: [
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
        { messageId: 'imperativeActionCreator' },
      ],
    },
  ],
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
})
ruleTester.run('no-imperative-action', rule, tests)
