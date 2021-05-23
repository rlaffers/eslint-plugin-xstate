# Forbid invalid properties in state node declarations

Forbid unrecognized properties in state nodes.

## Rule Details

State node declarations should not contain properties which are not recognized by XState.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  states: {
    idle: {
      id: 'idle-state',
      enter: 'log', // unrecognized property name
    },
  },
})

// ❌ context can be declared only on the root state node
createMachine({
  states: {
    idle: {
      context: {}, // ???
    },
  },
})

// ❌ invalid value of the "type" prop
createMachine({
  states: {
    idle: {
      type: 'paralel', // ??? typo in the value
    },
    finished: {
      type: 'done', // ??? "done" is not a valid type
    },
  },
})

// ❌ some props are valid only in specific contexts
createMachine({
  states: {
    idle: {
      type: 'compound',
      history: 'shallow', // ??? "history" prop is valid only on history nodes
      target: 'dirty', // ??? "target" prop is valid only on history nodes
    },
    busy: {
      type: 'atomic',
      initial: 'saving', // ??? "initial" prop is valid only on compound nodes
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ all state props are valid
createMachine({
  context: {}, // valid in the root node
  initial: 'idle'
  states: {
    idle: {
      type: 'parallel',
      entry: 'log',
      exit: 'log',
      always: [],
      after: {},
      states: {},
      onDone: {},
      on: {},
      tags: ['off'],
    },
    busy: {
      type: 'compound',
      initial: 'reading',
      states: {
        hist: {
          type: 'history',
          history: 'deep',
          target: 'writing',
        },
        reading: {
          meta: {
            value: 42,
          },
        },
        writing: {},
      },
    },
  },
})
```

## Further Reading

- [Transitions](https://xstate.js.org/docs/guides/transitions.html)
