# Forbid invalid properties in transition declarations

Forbid unrecognized properties in `on`, `onDone` and `onError` transition declarations.

## Rule Details

Transition declarations should not contain properties which are not recognized by XState.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  states: {
    idle: {
      on: {
        EVENT: {
          target: 'active',
          foo: true, // ???
        },
      },
    },
  },
})

// ❌
createMachine({
  states: {
    idle: {
      on: {
        EVENT: [
          {
            target: 'active',
            always: [], // ???
          },
        ],
      },
    },
  },
})

// ❌
createMachine({
  states: {
    heating: {
      type: 'compound',
      initial: 'cold',
      states: {
        cold: {},
        hot: { type: 'final' },
      },
      onDone: {
        target: 'cooling',
        foo: true, // ???
      },
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ only recognized properties inside transitions
createMachine({
  states: {
    idle: {
      on: {
        EVENT: {
          cond: () => true,
          target: 'active',
          actions: [],
          in: 'otherState.ready',
          internal: false,
          description: 'some text',
        },
      },
    },
  },
})
```

## Further Reading

- [Transitions](https://xstate.js.org/docs/guides/transitions.html)
