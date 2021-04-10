# Enforce proper usage of the spawn function

Ensure that the `spawn` function is used correctly.

## Rule Details

The `spawn` function has to be used in the context of an assignment function. Failing to do so creates an orphaned actor which has no effect.

Examples of **incorrect** code for this rule:

```javascript
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
