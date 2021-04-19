# Forbid onDone transitions on root state

Forbid `onDone` transitions on the root node of the state machine.

## Rule Details

The `onDone` transitions cannot be defined on the root state node. This is because `onDone` is a transition on a `'done.state.*'` event, and when a machine reaches its final state, it can no longer accept any event.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  onDone: {},
})

// ❌
createMachine({
  onDone: 'stopped',
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ onDone transition for an invoked service
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: {
        src: 'someService',
        onDone: 'passive',
      },
    },
    passive: {
      invoke: {
        src: 'someService',
        onDone: {
          target: 'active',
        },
      },
    },
  },
})

// ✅ onDone transition for a compound state node
createMachine({
  initial: 'active',
  states: {
    active: {
      initial: 'hot',
      states: {
        hot: {},
        cold: {},
      },
      onDone: 'passive',
    },
  },
})

// ✅ onDone transition for a parallel state node
createMachine({
  initial: 'active',
  states: {
    initializing: {
      type: 'parallel',
      states: {
        loadingImage: {},
        loadingText: {},
      },
      onDone: 'ready',
    },
  },
})
```
