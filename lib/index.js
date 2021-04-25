/**
 * @fileoverview ESLint rules for XState
 * @author Richard Laffers
 */
'use strict'

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports = {
  rules: {
    'spawn-usage': require('./rules/spawn-usage'),
    'event-names': require('./rules/event-names'),
    'state-names': require('./rules/state-names'),
    'no-infinite-loop': require('./rules/no-infinite-loop'),
    'no-inline-implementation': require('./rules/no-inline-implementation'),
    'no-imperative-action': require('./rules/no-imperative-action'),
    'no-root-ondone': require('./rules/no-root-ondone'),
    'no-ondone-outside-compound-state': require('./rules/no-ondone-outside-compound-state'),
    'invoke-usage': require('./rules/invoke-usage'),
    'entry-exit-action': require('./rules/entry-exit-action'),
    'prefer-always': require('./rules/prefer-always'),
    'no-auto-forward': require('./rules/no-auto-forward'),
  },
  configs: {
    recommended: {
      plugins: ['xstate'],
      rules: {
        'xstate/spawn-usage': 'error',
        'xstate/no-infinite-loop': 'error',
        'xstate/no-imperative-action': 'error',
        'xstate/no-root-ondone': 'error',
        'xstate/no-ondone-outside-compound-state': 'error',
        'xstate/invoke-usage': 'error',
        'xstate/entry-exit-action': 'error',
        'xstate/prefer-always': 'error',
      },
    },
    all: {
      plugins: ['xstate'],
      rules: {
        'xstate/spawn-usage': 'error',
        'xstate/no-infinite-loop': 'error',
        'xstate/no-imperative-action': 'error',
        'xstate/no-root-ondone': 'error',
        'xstate/no-ondone-outside-compound-state': 'error',
        'xstate/invoke-usage': 'error',
        'xstate/entry-exit-action': 'error',
        'xstate/event-names': ['warn', 'macroCase'],
        'xstate/state-names': ['warn', 'camelCase'],
        'xstate/no-inline-implementation': 'warn',
        'xstate/no-auto-forward': 'warn',
        'xstate/prefer-always': 'error',
      },
    },
  },
}
