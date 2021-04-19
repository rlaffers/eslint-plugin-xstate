# Forbid onDone transitions outside compound/parallel states

Forbid `onDone` transitions in state nodes other than `"compound"` or `"parallel"`.

## Rule Details

The `"onDone"` transitions make sense only in context of `"compound"` or `"parallel"` state nodes or `invoke` blocks. They have no effect in other state nodes.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  states: {
    active: {
      onDone: 'idle',
    },
  },
})

// ❌
createMachine({
  states: {
    stopped: {
      type: 'final',
      onDone: {
        actions: () => {},
      },
    },
  },
})

// ❌
createMachine({
  states: {
    hist: {
      type: 'history',
      onDone: 'active',
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ onDone transition inside a compound state node
createMachine({
  states: {
    active: {
      initial: 'hot',
      states: {
        hot: {},
        cold: {},
      },
      onDone: 'idle',
    },
  },
})

// ✅ onDone transition inside a parallel state node
createMachine({
  states: {
    active: {
      type: 'parallel',
      states: {
        loadingImage: {},
        loadingText: {},
      },
      onDone: 'idle',
    },
  },
})
```

## Further Reading

- [Final states](https://xstate.js.org/docs/guides/final.html)
