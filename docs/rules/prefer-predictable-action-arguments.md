# Use `predictableActionArguments: true` at the top-level of your machine config

Suggest using setting `predictableActionArguments` to `true` at the top-level of your machine config, like this:

```javascript
createMachine({
  predictableActionArguments: true,
  // ...
})
```

## Rule Details

With this flag XState will always call an action with the event directly responsible for the related transition.

Source from docs: https://xstate.js.org/docs/guides/actions.html#api

Examples of **incorrect** code for this rule:

```javascript
// ❌ predictableActionArguments is disabled
createMachine({
  predictableActionArguments: false,
  // ...
})

// ❌ predictableActionArguments is omitted

createMachine({
  states: {
    // ...
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ predictableActionArguments is enabled
createMachine({
  predictableActionArguments: true,
  // ...
})
```
