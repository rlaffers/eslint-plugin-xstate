# Forbid using action creators imperatively

Enforce using action creators declaratively.

## Rule Details

[Action creators](https://xstate.js.org/docs/guides/actions.html) (`assign`, `send`, `sendParent`, `respond`, `raise`, `forwardTo`, `choose`, `pure`, `log`, `escalate`) produce action objects which are executed later by the XState interpreter. Calling action creators imperatively has no effect.

Examples of **incorrect** code for this rule:

```javascript
// ❌ action creators called imperativelly
createMachine({
  entry: [
    () => send('EVENT'),
    () => {
      sendParent('EVENT')
    },
    function () {
      respond('EVENT')
    },
    () => raise('EVENT'),
  ],
  exit: () => assign({ count: 1 }),
  on: {
    TRIGGER: {
      actions: [
        () => forwardTo('someActor'),
        () => choose([]),
        () => pure(() => {}),
        () => log('log me'),
        () => escalate('error'),
      ],
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ all action creators are used declaratively
createMachine({
  entry: [send('EVENT'), sendParent('EVENT'), respond('EVENT'), raise('EVENT')],
  exit: assign({ count: 1 }),
  on: {
    TRIGGER: {
      actions: [
        forwardTo('someActor'),
        choose([]),
        pure(() => {}),
        log('log me'),
        escalate('error'),
      ],
    },
  },
})
```
