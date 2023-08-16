# Detect infinite loops with eventless transitions

Warn about possible infinite loop errors when using [eventless transitions](https://xstate.js.org/docs/guides/transitions.html#eventless-always-transitions).

## Rule Details

Carelessly defined eventless transitions have a potential of creating infinite loops during state machine execution. In Node.js you might see this error:

```
RangeError: Maximum call stack size exceeded
```

The XState interpreter keeps evaluating eventless transitions until either:

- a valid transition with a `target` is found
- all guards return false

If a valid transition without `target` (but with `actions`) is found, actions will be executed, and the evaluation routine starts again. If none of the above conditions are ever met, an infinite loop error will occur.

While complete protection against infinite eventless transition evaluation is not possible by static code analysis only, this rule reports many common mistakes which will or may cause the infinite loop error.

Examples of **incorrect** code for this rule:

```javascript
// ❌ Empty transition definition
createMachine({
  states: {
    deciding: {
      always: {},
    },
  },
})

// ❌ Empty transition definition
createMachine({
  states: {
    deciding: {
      always: [{}],
    },
  },
})

// ❌ The action on the 2nd transition does not update the context,
// so executing it will not make the 1st transition valid on the next evaluation.
// (or the 1st transition is always taken, so the 2nd transition is useless)
// XState v4
createMachine({
  states: {
    deciding: {
      always: [
        {
          cond: (ctx) => ctx.count > 5,
          target: 'idle',
        },
        // no guard, no target, no assign action
        {
          actions: () => console.log('hello'),
        },
      ],
    },
  },
})

// ❌ Same as above with XState v5
createMachine({
  states: {
    deciding: {
      always: [
        {
          guard: ({ context }) => context.count > 5,
          target: 'idle',
        },
        // no guard, no target, no assign action
        {
          actions: () => console.log('hello'),
        },
      ],
    },
  },
})

// ❌ No guard, no target. Even though it updates the context,
// it is the first transition in sequence, so it will be taken ad infinitum.
createMachine({
  states: {
    deciding: {
      always: [
        {
          actions: assign({ count: 1 }),
        },
      ],
    },
  },
})

// ❌ Unconditional transition to itself
createMachine({
  states: {
    deciding: {
      always: [
        {
          target: 'deciding',
        },
      ],
    },
  },
})

// ❌ No target. The action does not update the context. This transition is
// either useless (never taken because of its guard), or guarantees an
// infinite loop error (if its guard is passed once then it will always be passed).
// XState v4
createMachine({
  states: {
    deciding: {
      always: [
        {
          cond: () => {},
          actions: () => console.log('hello'),
        },
      ],
    },
  },
})

// ❌ Same as above with XState v5
createMachine({
  states: {
    deciding: {
      always: [
        {
          guard: () => {},
          actions: () => console.log('hello'),
        },
      ],
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ Has target (XState v4)
createMachine({
  states: {
    deciding: {
      always: [
        {
          cond: () => {},
          target: 'busy',
        },
        {
          target: 'idle',
        },
      ],
    },
  },
})

// ✅ Has target (XState v5)
createMachine({
  states: {
    deciding: {
      always: [
        {
          guard: () => {},
          target: 'busy',
        },
        {
          target: 'idle',
        },
      ],
    },
  },
})

// ✅ The second transition updates the context, so there's a chance
// that the first transition will eventually become valid.
// XState v4
createMachine({
  states: {
    deciding: {
      always: [
        {
          cond: (ctx) => ctx.count > 5,
          target: 'idle',
        },
        {
          actions: assign({ count: (ctx) => ctx.count + 1 }),
        },
      ],
    },
  },
})

// ✅ XState v5
createMachine({
  states: {
    deciding: {
      always: [
        {
          guard: ({ context }) => context.count > 5,
          target: 'idle',
        },
        {
          actions: assign({ count: ({ context }) => context.count + 1 }),
        },
      ],
    },
  },
})

// ✅ We are optimistic about the 2nd transition action updating the context.
// Therefore there's a chance that the first transition will eventually become valid.
// XState v4
createMachine({
  states: {
    deciding: {
      always: [
        {
          cond: (ctx) => ctx.count > 5,
          target: 'idle',
        },
        {
          actions: 'someAction', // hopefully an assign() action
        },
      ],
    },
  },
})

// XState v5
createMachine({
  states: {
    deciding: {
      always: [
        {
          guard: ({ context }) => context.count > 5,
          target: 'idle',
        },
        {
          actions: 'someAction', // hopefully an assign() action
        },
      ],
    },
  },
})
```
