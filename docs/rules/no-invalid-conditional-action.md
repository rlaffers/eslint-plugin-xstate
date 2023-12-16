# Forbid invalid properties in conditional actions

Forbid unrecognized properties in conditional actions passed to the `choose` action creator.

## Rule Details

Conditional action declarations may contains only `cond` and `actions` props.

### XState v5

In XState v5, the `cond` propery has been renamed to `guard`.

Examples of **incorrect** code for this rule:

```javascript
// ❌ (XState v4)
createMachine({
  states: {
    active: {
      on: {
        EVENT1: {
          actions: choose([
            {
              cond: 'myGuard',
              actions: [],
              foo: 'bar', // ???
              guard: 'myGuard', // ???
              invoke: 'myService', // ???
            },
          ]),
        },
      },
      entry: choose([
        {
          cond: 'myGuard',
          actions: [],
          foo: 'bar', // ???
          guard: 'myGuard', // ???
          invoke: 'myService', // ???
        },
      ]),
    },
  },
})

// ❌ (XState v5)
createMachine({
  states: {
    active: {
      on: {
        EVENT1: {
          actions: choose([
            {
              guard: 'myGuard',
              actions: [],
              cond: 'myGuard', // ???
            },
          ]),
        },
      },
      entry: choose([
        {
          guard: 'myGuard',
          actions: [],
          cond: 'myGuard', // ???
        },
      ]),
    },
  },
})

// ❌ The first argument passed to "choose" must be an array
createMachine({
  states: {
    active: {
      on: {
        EVENT1: {
          actions: [
            choose(), // ???
            choose({}), // ???
            choose(() => []), // ???
          ],
        },
      },
      entry: choose(''), // ???
      exit: choose(null), // ???
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ only recognized properties inside conditional actions (XState v4)
createMachine({
  states: {
    active: {
      on: {
        EVENT1: {
          actions: choose([
            {
              cond: 'myGuard',
              actions: [],
            },
          ]),
        },
      },
      entry: choose([
        {
          cond: 'myGuard',
          actions: [],
        },
      ]),
    },
  },
})

// ✅ only recognized properties inside conditional actions (XState v5)
createMachine({
  states: {
    active: {
      on: {
        EVENT1: {
          actions: choose([
            {
              guard: 'myGuard',
              actions: [],
            },
          ]),
        },
      },
      entry: choose([
        {
          guard: 'myGuard',
          actions: [],
        },
      ]),
    },
  },
})
```
