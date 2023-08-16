# Suggest refactoring machine logic into its options

Suggest moving implementations of actions, guards, activities and services into machine's options.

## Rule Details

Action/guard/activity/service implementation can be quickly prototyped by specifying inline functions directly in the machine config.
Although this is convenient, this makes it difficult to debug, test, serialize and accurately visualize actions. It is recommended to refactor inline implementations into the machine options object.

### XState v5

In XState v5 some built-in action creators were removed, so this rule will report an error when they are inlined:
- `respond`
- `send`: removed in favor of `raise` and `sendParent`
- `sendUpdate`
- `start`

XState v5 provides some built-in higher level guards: `and`, `or`, `not`, `stateIn`. These are always fine to use.

Examples of **incorrect** code for this rule:

```javascript
// ❌
createMachine({
  states: {
    inactive: {
      invoke: {
        src: () => Promise.resolve(42) // inlined service
      },
      on: {
        TRIGGER: {
          target: 'active',
          cond: () => {}, // inlined guard
          actions: () => {} // inlined action
        }
      },
      activities: () => {}, // inlined activity
      entry: assign({
        childActor: () => spawn(
          () => {}, // inlined actor
        )
      }),
    }
  }
})

// ❌ using variable references is not recommended for the same reasons
createMachine({
  states: {
    inactive: {
      invoke: {
        src: someMachine // defined elsewhere
      },
      on: {
        TRIGGER: {
          target: 'active',
          cond: isEnoughFuel, // defined elsewhere
          actions: huffAndPuff // defined elsewhere
        }
      },
      activities: beep, // defined elsewhere
      entry: assign({
        childActor: () => spawn(
          childMachine, // inlined actor
        )
      }),
    }
  }
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
          src: 'someMachine'
        },
        on: {
          TRIGGER: {
            target: 'active',
            cond: 'isEnoughFuel',
            actions: ['huffAndPuff', 'log'] // arrays are ok too
          }
        },
        activities: 'beep',
        entry: assign({
          childActor: () => spawn(
            'childMachine',
          )
        }),
      }
    }
  },
  {
    // "services" in XState v4, renamed to "actors" in XState v5
    services: {
      someMachine: () => {}
    },
    guards: {
      isEnoughFuel: () => true
    },
    actions: {
      huffAndPuff: () => {},
      log: () => {}
    },
    // only in XState v4
    activities: {
      beep: () => {}
    }
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
          actions: [assign({ count: 0 }), raise({ type: 'EVENT' })] // arrays are ok too
        }
      }
    }
  }
})

// ✅ inlined guard creator calls are ok if they match guardCreatorRegex
/* eslint no-inline-implementation: [ "warn", { "guardCreatorRegex": "^customGuard$" } ] */
createMachine({
  states: {
    inactive: {
      on: {
        BUTTON_CLICKED: {
          cond: customGuard(['isStartButton', 'isReady']),
          target: 'active'
        }
      }
    }
  }
})

// ✅ inlined built-in guards are ok with XState v5
createMachine({
  states: {
    inactive: {
      on: {
        BUTTON_CLICKED: [
          {
            guard: and(['isStartButton', 'isDoubleClick']),
            target: 'active'
          },
          {
            guard: stateIn('mode.active'),
            target: 'inactive'
          },
        ]
      }
    }
  }
})

// ✅ inlined action creator calls are ok if they match actionCreatorRegex
/* eslint no-inline-implementation: [ "warn", { "actionCreatorRegex": "^customAction$" } ] */
createMachine({
  states: {
    inactive: {
      on: {
        BUTTON_CLICKED: {
          target: 'active',
          actions: customAction(),
        }
      }
    }
  }
})

// ✅ inlined actor creator calls are ok if they match actorCreatorRegex
/* eslint no-inline-implementation: [ "warn", { "actorCreatorRegex": "^customActor" } ] */
createMachine({
  states: {
    inactive: {
      invoke: {
        src: customActor()
      }
    }
  }
})
```

## Options

| Option                     | Required | Default | Details                                                                                                                                                                                                                                           |
| -------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowKnownActionCreators` | No       | `false` | Inlined action creators are visualized properly (but still difficult to test, debug and serialize). Setting this option to `true` will turn off the rule for [known action creators](https://xstate.js.org/docs/guides/actions.html) used inline. |
| `guardCreatorRegex`        | No       | `''`    | Use a regular expression to allow custom guard creators.                                                                                                                                                                                          |
| `actionCreatorRegex`       | No       | `''`    | Use a regular expression to allow custom action creators.                                                                                                                                                                                         |
| `actorCreatorRegex`      | No       | `''`    | Use a regular expression to allow custom actor creators.                                                                                                                                                                                        |

## Example

```json
{
  "xstate/no-inline-implementation": [
    "warn",
    { "allowKnownActionCreators": true }
  ]
}

{
  "xstate/no-inline-implementation": [
    "warn",
    { "guardCreatorRegex": "^(and|or|not)$" }
  ]
}

{
  "xstate/no-inline-implementation": [
    "warn",
    { "actionCreatorRegex": "^customAction$" }
  ]
}

{
  "xstate/no-inline-implementation": [
    "warn",
    { "actorCreatorRegex": "^customActor$" }
  ]
}
```
