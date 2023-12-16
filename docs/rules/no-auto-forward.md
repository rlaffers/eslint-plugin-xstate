# Forbid auto-forwarding events

Prefer sending events explicitly to child actors/services.

## Rule Details

Avoid blindly forwarding all events to invoked services or spawned actors - it may lead to unexpected behavior or infinite loops. The official documentation [suggests sending events explicitly](https://xstate.js.org/docs/guides/communication.html#the-invoke-property) with the [`forwardTo`](https://xstate.js.org/docs/guides/actions.html#forward-to-action) or `send` action creators.

**XState v5 removed the `autoForward` option. This rule will report errors if `autoForward` is used with XState v5.**

Examples of **incorrect** code for this rule:

```javascript
// ❌ auto-forwarding events to an invoked service
createMachine({
  states: {
    playing: {
      invoke: {
        src: 'game',
        autoForward: true,
      },
    },
  },
})

// ❌ auto-forwarding events to a spawned actor
createMachine({
  states: {
    initializing: {
      entry: assign({
        gameRef: () => spawn(game, { autoForward: true }),
      }),
    },
  },
})
```

Examples of **correct** code for this rule (XState v4 only):

```javascript
// ✅ no auto-forward
createMachine{{
  states: {
    playing: {
      invoke: {
        src: 'game',
      },
    },
  },
}}

// ✅ autoForward set to false
createMachine({
  states: {
    initializing: {
      entry: assign({
        gameRef: () => spawn(game, { autoForward: false }),
      }),
    },
  },
})
```
