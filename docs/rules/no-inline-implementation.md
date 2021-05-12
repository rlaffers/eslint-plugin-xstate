# Suggest refactoring machine logic into its options

Suggest moving implementations of actions, guards, activities and services into machine's options.

## Rule Details

Action/guard/activity/service implementation can be quickly prototyped by specifying inline functions directly in the machine config.
Although this is convenient, this makes it difficult to debug, test, serialize and accurately visualize actions. It is recommended to refactor inline implementations into the machine options object.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  states: {
    inactive: {
      invoke: {
        src: () => Promise.resolve(42), // inlined service
      },
      on: {
        TRIGGER: {
          target: 'active',
          cond: () => {}, // inlined guard
          actions: () => {}, // inlined action
        },
      },
      activities: () => {}, // inlined activity
    },
  },
})

// ❌ using variable references is not recommended for the same reasons
createMachine({
  states: {
    inactive: {
      invoke: {
        src: someMachine, // defined elsewhere
      },
      on: {
        TRIGGER: {
          target: 'active',
          cond: isEnoughFuel, // defined elsewhere
          actions: huffAndPuff, // defined elsewhere
        },
      },
      activities: beep, // defined elsewhere
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ everything referred by a string
createMachine(
  {
    states: {
      inactive: {
        invoke: {
          src: 'someMachine',
        },
        on: {
          TRIGGER: {
            target: 'active',
            cond: 'isEnoughFuel',
            actions: ['huffAndPuff', 'log'], // arrays are ok too
          },
        },
        activities: 'beep',
      },
    },
  },
  {
    services: {
      someMachine: () => {},
    },
    guards: {
      isEnoughFuel: () => true,
    },
    actions: {
      huffAndPuff: () => {},
      log: () => {},
    },
    activities: {
      beep: () => {},
    },
  }
)

// ✅ inlined action creator calls are ok if allowKnownActionCreators=true
/* eslint no-inline-implementation: [ "warn", { "allowKnownActionCreators": true } ] */
createMachine({
  states: {
    inactive: {
      entry: assign({ count: 1 }),
      on: {
        TRIGGER: {
          actions: [assign({ count: 0 }), send('EVENT')], // arrays are ok too
        },
      },
    },
  },
})
```

## Options

| Option                     | Required | Default | Details                                                                                                                                                                                                                                           |
| -------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowKnownActionCreators` | No       | `false` | Inlined action creators are visualized properly (but still difficult to test, debug and serialize). Setting this option to `true` will turn off the rule for [known action creators](https://xstate.js.org/docs/guides/actions.html) used inline. |

## Example

```json
{
  "xstate/no-inline-implementation": [
    "warn",
    { "allowKnownActionCreators": true }
  ]
}
```
