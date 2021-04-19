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
    'no-infinite-loop': require('./rules/no-infinite-loop'),
    'no-inline-implementation': require('./rules/no-inline-implementation'),
    'no-imperative-action': require('./rules/no-imperative-action'),
    'no-root-ondone': require('./rules/no-root-ondone'),
    'no-ondone-outside-compound-state': require('./rules/no-ondone-outside-compound-state'),
    'invoke-usage': require('./rules/invoke-usage'),
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
        'xstate/event-names': 'warn',
        'xstate/no-inline-implementation': 'warn',
      },
    },
  },
}
