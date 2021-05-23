# eslint-plugin-xstate

ESLint plugin to check for common mistakes and enforce good practices when using [XState library](https://xstate.js.org/).

[![npm version](https://img.shields.io/npm/v/eslint-plugin-xstate)](https://npmjs.com/package/eslint-plugin-xstate)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-xstate`:

```
$ npm install eslint-plugin-xstate --save-dev
```

## Usage

Add `xstate` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["xstate"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "xstate/spawn-usage": "error",
    "xstate/no-infinite-loop": "error",
    "xstate/no-imperative-action": "error",
    "xstate/no-root-ondone": "error",
    "xstate/no-ondone-outside-compound-state": "error",
    "xstate/invoke-usage": "error",
    "xstate/entry-exit-action": "error",
    "xstate/prefer-always": "error",
    "xstate/no-misplaced-on-transition": "error",
    "xstate/no-invalid-transition-props": "error",
    "xstate/no-invalid-state-props": "error",
    "xstate/no-async-guard": "error",
    "xstate/event-names": ["warn", "macroCase"],
    "xstate/state-names": ["warn", "camelCase"],
    "xstate/no-inline-implementation": "warn",
    "xstate/no-auto-forward": "warn"
  }
}
```

## Shareable Configurations

This plugin exports a `recommended` configuration which checks for common mistakes. To enable this configuration use the `extends` property in your `.eslintrc.js` config file:

```json
{
  "extends": ["plugin:xstate/recommended"]
}
```

There is also an `all` configuration which includes every available rule. It enforces both correct usage and best XState practices.

```json
{
  "extends": ["plugin:xstate/all"]
}
```

## Supported Rules

### Possible Errors

| Rule                                                                               | Description                                                        | Recommended        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------ |
| [spawn-usage](docs/rules/spawn-usage.md)                                           | Enforce correct usage of `spawn`                                   | :heavy_check_mark: |
| [no-infinite-loop](docs/rules/no-infinite-loop.md)                                 | Detect infinite loops with eventless transitions                   | :heavy_check_mark: |
| [no-imperative-action](docs/rules/no-imperative-action.md)                         | Forbid using action creators imperatively                          | :heavy_check_mark: |
| [no-root-ondone](docs/rules/no-root-ondone.md)                                     | Forbid onDone transitions on root nodes                            | :heavy_check_mark: |
| [no-ondone-outside-compound-state](docs/rules/no-ondone-outside-compound-state.md) | Forbid onDone transitions on `atomic`, `history` and `final` nodes | :heavy_check_mark: |
| [invoke-usage](docs/rules/invoke-usage.md)                                         | Enforce correct invocation of services                             | :heavy_check_mark: |
| [entry-exit-action](docs/rules/entry-exit-action.md)                               | Forbid invalid declarations of entry/exit actions                  | :heavy_check_mark: |
| [no-misplaced-on-transition](docs/rules/no-misplaced-on-transition.md)             | Forbid invalid declarations of `on` transitions                    | :heavy_check_mark: |
| [no-invalid-transition-props](docs/rules/no-invalid-transition-props.md)           | Forbid invalid properties in transition declarations               | :heavy_check_mark: |
| [no-invalid-state-props](docs/rules/no-invalid-state-props.md)                     | Forbid invalid properties in state node declarations               | :heavy_check_mark: |
| [no-async-guard](docs/rules/no-async-guard.md)                                     | Forbid asynchronous guard functions                                | :heavy_check_mark: |

### Best Practices

| Rule                                                               | Description                                                             | Recommended        |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------ |
| [no-inline-implementation](docs/rules/no-inline-implementation.md) | Suggest refactoring guards, actions and services into machine options   |                    |
| [prefer-always](docs/rules/prefer-always.md)                       | Suggest using the `always` syntax for transient (eventless) transitions | :heavy_check_mark: |
| [no-auto-forward](docs/rules/no-auto-forward.md)                   | Forbid auto-forwarding events to invoked services or spawned actors     |                    |

### Stylistic Issues

| Rule                                     | Description                                                              | Recommended |
| ---------------------------------------- | ------------------------------------------------------------------------ | ----------- |
| [event-names](docs/rules/event-names.md) | Suggest consistent formatting of event names                             |             |
| [state-names](docs/rules/state-names.md) | Suggest consistent formatting of state names and prevent confusing names |             |
