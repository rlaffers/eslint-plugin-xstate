# Use `predictableActionArguments: true` at the top-level of your machine config

Suggest using setting `predictableActionArguments` to `true` at the top-level of your machine config (with XState v4), like this:

```javascript
createMachine({
  predictableActionArguments: true,
  // ...
})
```

## Rule Details

With this flag XState will always call an action with the event directly responsible for the related transition.

Source from docs: https://xstate.js.org/docs/guides/actions.html#api

### XState v5

In XState v5 the `predictableActionArguments` was removed. This rule will report an error if the option is used in your machine config.

Examples of **incorrect** code for this rule:

```javascript
// ❌ predictableActionArguments is disabled
createMachine({
  predictableActionArguments: false,
  // ...
})

// ❌ predictableActionArguments is omitted (XState v4)
createMachine({
  states: {
    // ...
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ predictableActionArguments is enabled (XState v4)
createMachine({
  predictableActionArguments: true,
  // ...
})

// ✅ predictableActionArguments is not used (XState v5)
createMachine({
  // ...
})
```
