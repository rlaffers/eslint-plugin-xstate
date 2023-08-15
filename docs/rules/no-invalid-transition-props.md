# Forbid invalid properties in transition declarations

Forbid unrecognized properties in `on`, `onDone` and `onError` transition declarations.

## Rule Details

Transition declarations should not contain properties which are not recognized by XState.

### XState v5

In XState v5, the following transition properties are no longer valid:

- `cond`: removed in favor of `guard`
- `in`: removed in favor of the `stateIn` guard
- `internal`: removed in favor of `reenter`

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
// ✅ only recognized properties inside transitions (XState v4)
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

// ✅ only recognized properties inside transitions (XState v5)
createMachine({
  states: {
    idle: {
      on: {
        EVENT: {
          guard: () => true,
          target: 'active',
          actions: [],
          reenter: true,
          description: 'some text',
        },
        OTHER_EVENT: {
          // "stateIn" instead of the "in" guard
          guard: stateIn('otherState.ready'),
          target: 'active',
        },
      },
    },
  },
})
```

## Further Reading

- [Transitions](https://xstate.js.org/docs/guides/transitions.html)
