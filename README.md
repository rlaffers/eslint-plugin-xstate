# eslint-plugin-xstate

ESLint plugin to check for common mistakes and enforce good practices when using [XState library](https://xstate.js.org/).

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

| Rule        | Description                      | Configurations |
| ----------- | -------------------------------- | -------------- |
| spawn-usage | Enforce correct usage of `spawn` | recommended    |

## TODO

- incorrect stopping of actors with Intepreter#stop method
- enforce UPPERCASE event names
