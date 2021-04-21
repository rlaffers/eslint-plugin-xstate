# Suggest consistent formatting of state names

Suggest using state names formatted with the preconfigured style (camelCase, snake_case, PascalCase or regex).

# Rule Details

While the XState library neither enforces nor recommends any particular format for state node names, maintaining a consistent formatting of state names helps readability. Four styles to choose from are available:

- camelCase [*default*]
- snake_case
- PascalCase
- regular expression

The default camelCase for state names is used by the official XState documentation.

Examples of **incorrect** code for this rule:

```javascript
// ❌ state names not in camelCase
/* eslint event-names: [ "warn", "camelCase" ] */
createMachine({
  states: {
    PowerOn: {},
    power_on: {},
    'power:on': {},
    'power.on': {},
  },
})

// ❌ state names violates the given regex
/* eslint event-names: [ "warn", "regex", { "regex": "^\\w+:\\w+$" } ] */
createMachine({
  states: {
    PowerOn: {},
    power_on: {},
  },
})
```

Examples of **correct** code for this rule:

```javascript
// ✅
/* eslint event-names: [ "warn", "camelCase" ] */
createMachine({
  states: {
    powerOn: {},
    powerOff: {},
  },
})

// ✅
/* eslint event-names: [ "warn", "regex", { "regex": "^\\w+:\\w+$" } ] */
createMachine({
  states: {
    'power:on': {},
    'mode:1': {},
  },
})
```

## Options

| Option   | Required | Default     | Details                                                                                         |
| -------- | -------- | ----------- | ----------------------------------------------------------------------------------------------- |
| [string] | No       | `camelCase` | Selects one of the available formatting styles: `camelCase`, `snakeCase`, `pascalCase`, `regex` |
| [object] | No       | `undefined` | The second option is an object with properties: `regex` (string)                                |

## Example

```json
{
  "xstate/state-names": ["warn", "PascalCase"]
}

{
  "xstate/state-names": ["warn", "regex", { "regex": "^[a-z]+$" }]
}
```
