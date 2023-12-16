# Enforce proper usage of the spawn function

Ensure that the `spawn` function imported from xstate is used correctly.

** This rule is compatible with XState v4 only! **

## Rule Details

The `spawn` function has to be used in the context of an assignment function. Failing to do so creates an orphaned actor which has no effect.

### XState v5

XState v5 changed the way the `spawn` function is accessed. This effectively eliminated the possibility of using the `spawn` function outside of the `assign` function. Therefore, this rule becomes obsolete in XState v5. Do not use it with XState v5.

Examples of **incorrect** code for this rule:

```javascript
import { spawn } from 'xstate'

// ❌ spawn called outside of a state machine
const someActorRef = spawn(someMachine)

// ❌ spawn is not an action creator
{
  actions: spawn(someMachine)
}

// ❌ spawn called outside of an assignment function
{
  actions: assign({
    // execute in context of the parent machine definition
    someActorRef: spawn(someMachine),
  })
}
```

Examples of **correct** code for this rule:

```javascript
import { spawn } from 'xstate'

// ✅ spawn called lazily inside an object assigner
{
  actions: assign({
    someActorRef: () => spawn(someMachine),
  })
}

// ✅ spawn called inside a function assigner
{
  actions: assign(() => ({
    someActorRef: spawn(someMachine),
  }))
}
```

## Further Reading

- [Spawning actors](https://xstate.js.org/docs/guides/actors.html#spawning-actors)
