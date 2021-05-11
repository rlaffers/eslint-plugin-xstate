# Forbid transition declarations in wrong contexts

Forbid `on` transitions in places other than state nodes.

## Rule Details

Transition declarations makes sense only in the context of state nodes. They have no effects when declared elsewhere.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  states: {
    on: {
      EVENT: 'passive',
    },
    active: {},
  },
})

// ❌
createMachine({
  states: {
    active: {
      invoke: {
        src: 'someService',
        on: {
          EVENT: 'passive',
        },
      },
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ transitions inside a state node
createMachine({
  states: {
    active: {
      on: {
        EVENT: 'passive',
      },
    },
  },
})

// ✅ root node transitions are fine too
createMachine({
  states: {
    active: {},
  },
  on: {
    EVENT: 'passive',
  },
})

// ✅ transitions taken out of invoke into the state node
createMachine({
  states: {
    active: {
      invoke: {
        src: 'someService',
      },
      on: {
        EVENT: 'passive',
      },
    },
  },
})
```

## Further Reading

- [Transitions](https://xstate.js.org/docs/guides/transitions.html)
