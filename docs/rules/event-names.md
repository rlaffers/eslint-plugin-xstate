# Suggest properly formatted event names

Suggest using event names formatted in MACRO_CASE (a.k.a. SCREAMING_SNAKE_CASE).

# Rule Details

While the XState library neither enforces nor recommends any particular format for event names, an _unofficial_ convention is using MACRO_CASE event names. Naming events this way helps to keep your code base consistent with the typical coding style adopted by the XState community.

Examples of **incorrect** code for this rule:

```javascript
// ❌ malformed event names
createMachine({
  on: {
    badEventName: 'busy',
    poor_name: 'busy',
    'Malformed Event Name': 'busy',
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ MACRO_CASE event names or a computed event name
createMachine({
  on: {
    TOGGLE: 'busy',
    START_WORK: 'busy',
    RUN: 'busy',
    [eventName]: 'busy',
  },
})

// ✅ objects outside of machine declarations are not relevant for this rule
const obj = {
  on: {
    thisIsNotEvent: 'foo',
    'neither.is.this': 'foo',
  },
}
```
