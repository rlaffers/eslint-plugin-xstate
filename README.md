# eslint-plugin-xstate

ESLint plugin to check for common mistakes and enforce good practices when using [XState library](https://xstate.js.org/).

[![npm version](https://img.shields.io/npm/v/eslint-plugin-xstate)](https://github.com/rlaffers/eslint-plugin-xstate)
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
    "xstate/spawn-usage": "error"
  }
}
```

## Shareable Configurations

This plugin exports a recommended configuration. To enable this configuration use the `extends` property in your `.eslintrc.js` config file:

```json
{
  "extends": ["plugin:xstate/recommended"]
}
```

## Supported Rules

| Rule                                     | Description                      | Configurations |
| ---------------------------------------- | -------------------------------- | -------------- |
| [spawn-usage](docs/rules/spawn-usage.md) | Enforce correct usage of `spawn` | recommended    |

## TODO

- detect incorrect stopping of actors with Intepreter#stop method
- recommend UPPERCASE event names
- detect infinite loops
- detect missing initial state for non-parallel state nodes
