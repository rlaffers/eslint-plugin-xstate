# Use `always` instead of deprecated empty string transient transitions

Suggest using the new `always` syntax for declaring transient (a.k.a. eventless) transitions instead of the deprecated empty string syntax.

## Rule Details

XState v4.11+ provides a new `always` syntax for declaring [transient transitions](https://xstate.js.org/docs/guides/transitions.html#transient-transitions), now called [eventless transitions](https://xstate.js.org/docs/guides/transitions.html#eventless-always-transitions). The empty string syntax will be deprecated in v5.

Examples of **incorrect** code for this rule:

```javascript
// ❌ transient transition declared with an empty string
createMachine({
  states: {
    playing: {
      on: {
        '': [
          { target: 'win', cond: 'didPlayerWin' },
          { target: 'lose', cond: 'didPlayerLose' },
        ],
      },
    },
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ using the new "always" syntax
createMachine({
  states: {
    playing: {
      always: [
        { target: 'win', cond: 'didPlayerWin' },
        { target: 'lose', cond: 'didPlayerLose' },
      ],
    },
  },
})
```
