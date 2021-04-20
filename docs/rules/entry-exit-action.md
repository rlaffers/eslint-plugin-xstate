# Forbid invalid entry/exit actions declarations

Enforce valid declarations of `entry` and `exit` actions.

# Rule Details

It is easy to mistake `entry`/`exit` action declarations with transition declarations, especially when user wishes to declare a conditional action. Valid `entry`/`exit` actions are:

- a function
- an [action creator](https://xstate.js.org/docs/guides/actions.html#declarative-actions) call
- an action object
- a string, which refers to any of the above in this machine's `options.actions`
- a variable, which refers to any of the above
- an array with any of the above elements

Most notably, an action **is not** an object with a `cond` property:

```javascript
// ❌ this is a transition, not action declaration
{
  entry: {
    cond: 'someGuard',
    actions: 'someAction'
  }
}
```

Examples of **incorrect** code for this rule:

```javascript
// ❌ confused transitions with actions
createMachine({
  entry: [
    {
      cond: 'someGuard',
      actions: 'someAction',
    },
    {
      actions: 'defaultAction',
    },
  ],
})

// ❌ invalid entry/exit action values
createMachine({
  entry: 123, // numbers are invalid
  exit: {}, // objects without a "type" property are invalid
})

// ❌ array od invalid action values
createMachine({
  entry: [123, {}, { actions: 'someAction' }],
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ using valid action values
createMachine({
  entry: 'someAction',
  exit: ['someAction', () => {}, assign({ foo: true }), someAction],
})

// ✅ declare conditional actions with "choose"
createMachine({
  entry: choose([
    {
      cond: 'someGuard',
      actions: 'someAction',
    },
    {
      actions: 'defaultAction',
    },
  ]),
})

// ✅ alternatively, declare conditional/dynamic actions with "pure"
createMachine({
  entry: pure((ctx) => {
    const actions = []
    // your conditional logic here
    // if (someCondition) actions.push('someAction')
    return actions
  }),
})
```
