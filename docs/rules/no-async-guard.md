# Forbid using asynchronous guards

[Guard functions](https://xstate.js.org/docs/guides/guards.html#guards-condition-functions) must not be asynchronous.

## Rule Details

Async functions return a promise which is a truthy value. Therefore, async guard function always pass. A transition guarded by such function will always be taken as if no `cond` was specified.

Examples of **incorrect** code for this rule:

```javascript
// ❌ async guard in an event transition
createMachine({
  on: {
    EVENT: {
      cond: async () => {},
      target: 'active',
    },
  },
})

// ❌ async guard in an onDone transition
createMachine({
  states: {
    active: {
      invoke: {
        src: 'myService',
        onDone: {
          cond: async function () {},
          target: 'finished',
        },
      },
    },
  },
})

// ❌ async guard in the choose action creator
createMachine({
  entry: choose([
    {
      cond: async () => {},
      actions: 'myAction',
    },
  ]),
})

// ❌ async guards in machine options
createMachine(
  {
    on: {
      EVENT: {
        cond: 'myGuard',
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
// ✅ guard is synchronous
createMachine({
  on: {
    EVENT: {
      cond: () => {},
      target: 'active',
    },
  },
})

// ✅ guard is synchronous
createMachine({
  states: {
    active: {
      invoke: {
        src: 'myService',
        onDone: {
          cond: function () {},
          target: 'finished',
        },
      },
    },
  },
})

// ✅ all guards in machine options are synchronous
createMachine(
  {
    on: {
      EVENT: {
        cond: 'myGuard',
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
