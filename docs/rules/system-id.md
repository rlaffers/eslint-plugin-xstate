# Suggest valid systemId for invoked or spawned actors

Provide `systemId` for invoked and spawned actors to make them available in the `actor.system` registry.

## Rule Details

Specifying a `systemId` property within `invoke` blocks, and within options passed as a second argument to `spawn` calls, will make the actor available in the `actor.system` registry.

**The `systemId` property is supported in XState version 5 and above.**

Examples of **incorrect** code for this rule:

```javascript
// ❌ missing systemId in an invoke block
createMachine({
  states: {
    playing: {
      invoke: {
        src: 'game',
      },
    },
  },
})

// ❌ missing systemId in a spawn call
createMachine({
  states: {
    initializing: {
      entry: assign({
        gameRef: () => spawn(game),
      }),
    },
  },
})

// ❌ invalid systemId value
createMachine({
  states: {
    playing: {
      invoke: {
        src: 'game',
        system: [],
      },
    },
  },
})

// ❌ duplicate systemIds
createMachine({
  states: {
    playing: {
      invoke: {
        src: 'game',
        system: 'actor1',
      },
      entry: assign({
        gameRef: () => spawn(game, { systemId: 'actor1' }),
      }),
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅
createMachine{{
  states: {
    playing: {
      invoke: {
        src: 'game',
        systemId: 'actor1',
      },
    },
  },
}}

// ✅
createMachine({
  states: {
    initializing: {
      entry: assign({
        gameRef: () => spawn(game, { systemId: 'actor1' }),
      }),
    },
  },
})
```
