# Forbid using asynchronous guards

[Guard functions](https://xstate.js.org/docs/guides/guards.html#guards-condition-functions) must not be asynchronous.

## Rule Details

Async functions return a promise which is a truthy value. Therefore, async guard functions always pass. Transitions guarded by such functions will always be taken as if no `cond` (XState v4) or `guard` (XState v5) was specified.

Examples of **incorrect** code for this rule:

```javascript
// ❌ async guard in an event transition (XState v4)
createMachine({
  on: {
    EVENT: {
      cond: async () => {},
      target: 'active',
    },
  },
})

// ❌ async guard in an event transition (XState v5)
createMachine({
  on: {
    EVENT: {
      guard: async () => {},
      target: 'active',
    },
  },
})

// ❌ async guard in an onDone transition (XState v5)
createMachine({
  states: {
    active: {
      invoke: {
        src: 'myService',
        onDone: {
          guard: async function () {},
          target: 'finished',
        },
      },
    },
  },
})

// ❌ async guard in the choose action creator (XState v5)
createMachine({
  entry: choose([
    {
      guard: async () => {},
      actions: 'myAction',
    },
  ]),
})

// ❌ async guards in machine options (XState v5)
createMachine(
  {
    on: {
      EVENT: {
        guard: 'myGuard',
        target: 'active',
      },
    },
  },
  {
    guards: {
      myGuard: async () => {},
      myGuard2: async function () {},
      async myGuard3() {},
    },
  }
)
```

Examples of **correct** code for this rule:

```javascript
// ✅ guard is synchronous (XState v4)
createMachine({
  on: {
    EVENT: {
      cond: () => {},
      target: 'active',
    },
  },
})

// ✅ guard is synchronous (XState v5)
createMachine({
  on: {
    EVENT: {
      guard: () => {},
      target: 'active',
    },
  },
})

// ✅ guard is synchronous (XState v5)
createMachine({
  states: {
    active: {
      invoke: {
        src: 'myService',
        onDone: {
          guard: function () {},
          target: 'finished',
        },
      },
    },
  },
})

// ✅ all guards in machine options are synchronous (XState v5)
createMachine(
  {
    on: {
      EVENT: {
        guard: 'myGuard',
        target: 'active',
      },
    },
  },
  {
    guards: {
      myGuard: () => {},
      myGuard2: function () {},
      myGuard3() {},
    },
  }
)
```
