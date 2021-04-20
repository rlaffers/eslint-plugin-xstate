# Suggest consistent formatting of event names

Suggest using event names formatted with the preconfigured style (MACRO_CASE, snake_case or camelCase).

# Rule Details

While the XState library neither enforces nor recommends any particular format for event names, maintaining a consistent formatting of event names helps readability. Three styles to choose from are available:

- MACRO_CASE (a.k.a. SCREAMING_SNAKE_CASE) [*default*]
- snake_case
- camelCase

The default MACRO*CASE for event names is an \_unofficial* convention, typically used within the XState community.

Examples of **incorrect** code for this rule:

```javascript
// ❌ event names not in MACRO_CASE
/* eslint event-names: [ "warn", "macroCase" ] */
createMachine({
  on: {
    myEvent: 'busy',
    my_event: 'busy',
    'My Event': 'busy',
    'myEvent.*': 'busy',
  },
  entry: [
    send('myEvent'),
    sendParent('my_event'),
    respond('My Event'),
    raise('myEvent.click'),
    send({ type: 'myEvent' }),
  ],
})

// ❌ event names not in snake_case
/* eslint event-names: [ "warn", "snakeCase" ] */
createMachine({
  on: {
    myEvent: 'busy',
    MY_EVENT: 'busy',
    'My Event': 'busy',
    'myEvent.*': 'busy',
  },
  entry: [
    send('myEvent'),
    sendParent('MY_EVENT'),
    respond('My Event'),
    raise('myEvent.click'),
    send({ type: 'myEvent' }),
  ],
})

// ❌ event names not in camelCase
/* eslint event-names: [ "warn", "camelCase" ] */
createMachine({
  on: {
    my_event: 'busy',
    MY_EVENT: 'busy',
    'My Event': 'busy',
    'my_event.*': 'busy',
  },
  entry: [
    send('my_event'),
    sendParent('MY_EVENT'),
    respond('My Event'),
    raise('my_event.click'),
    send({ type: 'my_event' }),
  ],
})

// ❌ events with wildcards cannot be sent with action creators
createMachine({
  entry: [
    send('EVENT.*'),
    sendParent('EVENT.CLICK.*'),
    respond('*'),
    raise('EVENT.*'),
    send({ type: 'EVENT.*' }),
  ],
})
```

Examples of **correct** code for this rule:

```javascript
// ✅ MACRO_CASE event names or a computed event name
/* eslint event-names: [ "warn", "macroCase" ] */
createMachine({
  on: {
    TOGGLE: 'busy',
    START_WORK: 'busy',
    'MOUSE.CLICK': 'busy',
    'MY_MOUSE.*': 'busy',
    [eventName]: 'busy',
    '*': 'busy',
  },
  entry: [
    send('TOGGLE'),
    respond('START_WORK'),
    sendParent('MOUSE.CLICK'),
    raise('MY_MOUSE.SCROLL_DOWN'),
    send({ type: 'TOGGLE' }),
  ],
})

// ✅ snake_case event names or a computed event name
/* eslint event-names: [ "warn", "snakeCase" ] */
createMachine({
  on: {
    toggle: 'busy',
    start_work: 'busy',
    'mouse.click': 'busy',
    'my_mouse.*': 'busy',
    [eventName]: 'busy',
    '*': 'busy',
  },
  entry: [
    send('toggle'),
    respond('start_work'),
    sendParent('mouse.click'),
    raise('my_mouse.scroll_down'),
    send({ type: 'toggle' }),
  ],
})

// ✅ camel_case event names or a computed event name
/* eslint event-names: [ "warn", "camelCase" ] */
createMachine({
  on: {
    toggle: 'busy',
    startWork: 'busy',
    'mouse.click': 'busy',
    'myMouse.*': 'busy',
    [eventName]: 'busy',
    '*': 'busy',
  },
  entry: [
    send('toggle'),
    respond('startWork'),
    sendParent('mouse.click'),
    raise('myMouse.scrollDown'),
    send({ type: 'toggle' }),
  ],
})

// ✅ objects outside of machine declarations are not relevant for this rule
const obj = {
  on: {
    thisIsNotEvent: 'foo',
    'neither.is.this': 'foo',
  },
}
```

## Options

| Option   | Required | Default     | Details                                                                               |
| -------- | -------- | ----------- | ------------------------------------------------------------------------------------- |
| [string] | No       | `macroCase` | Selects one of the available formatting styles: `macroCase`, `snakeCase`, `camelCase` |

## Example

```json
{
  "xstate/event-names": ["warn", "camelCase"]
}
```
