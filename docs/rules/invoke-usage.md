# Enforce correct invocation of services

Enforce that the [`invoke` property](https://xstate.js.org/docs/guides/communication.html#the-invoke-property) of state nodes is correctly used.

## Rule Details

The `invoke` property used to invoke service must have an object value with a `src` property, which can be:

- a machine
- a function that returns a Promise
- a function that returns a "callback handler"
- a function that returns an observable
- a string, which refers to any of the 4 listed options defined in this machine's `options.services`

Examples of **incorrect** code for this rule:

```javascript
// ❌ invoke must not be a function
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: () => {},
    },
  },
})

// ❌ invoke must not be a string
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: 'someService',
    },
  },
})

// ❌ invoke object must have a src property
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: {
        onDone: 'inactive',
      },
    },
  },
})

// ❌ the src property must be machine, function, string or object
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: {
        src: true,
      },
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: {
        src: () => {},
      },
    },
  },
})

// ✅
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: {
        src: 'someService',
      },
    },
  },
})

// ✅ "src" from a variable is fine
createMachine({
  initial: 'active',
  states: {
    active: {
      invoke: {
        src: someService,
      },
    },
  },
})
```
