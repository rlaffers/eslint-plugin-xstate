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
    'no-ondone-outside-compound-state': require('./rules/no-ondone-outside-compound-state'),
    'invoke-usage': require('./rules/invoke-usage'),
    'entry-exit-action': require('./rules/entry-exit-action'),
    'prefer-always': require('./rules/prefer-always'),
    'prefer-predictable-action-arguments': require('./rules/prefer-predictable-action-arguments'),
    'no-auto-forward': require('./rules/no-auto-forward'),
    'no-misplaced-on-transition': require('./rules/no-misplaced-on-transition'),
    'no-invalid-transition-props': require('./rules/no-invalid-transition-props'),
    'no-invalid-state-props': require('./rules/no-invalid-state-props'),
    'no-async-guard': require('./rules/no-async-guard'),
    'no-invalid-conditional-action': require('./rules/no-invalid-conditional-action'),
  },
  configs: {
    // Requires: xstate@5
    recommended: {
      settings: {
        xstate: {
          version: 5,
        },
      },
      plugins: ['xstate'],
      rules: {
        'xstate/no-infinite-loop': 'error',
        'xstate/no-imperative-action': 'error',
        'xstate/no-ondone-outside-compound-state': 'error',
        'xstate/invoke-usage': 'error',
        'xstate/entry-exit-action': 'error',
        'xstate/prefer-always': 'error',
        'xstate/prefer-predictable-action-arguments': 'error',
        'xstate/no-misplaced-on-transition': 'error',
        'xstate/no-invalid-transition-props': 'error',
        'xstate/no-invalid-state-props': 'error',
        'xstate/no-invalid-conditional-action': 'error',
        'xstate/no-async-guard': 'error',
        'xstate/no-auto-forward': 'error',
      },
    },
    // Requires: xstate@5
    all: {
      settings: {
        xstate: {
          version: 5,
        },
      },
      plugins: ['xstate'],
      rules: {
        'xstate/no-infinite-loop': 'error',
        'xstate/no-imperative-action': 'error',
        'xstate/no-ondone-outside-compound-state': 'error',
        'xstate/invoke-usage': 'error',
        'xstate/entry-exit-action': 'error',
        'xstate/event-names': ['warn', 'macroCase'],
        'xstate/state-names': ['warn', 'camelCase'],
        'xstate/no-inline-implementation': 'warn',
        'xstate/no-auto-forward': 'error',
        'xstate/prefer-always': 'error',
        'xstate/prefer-predictable-action-arguments': 'error',
        'xstate/no-misplaced-on-transition': 'error',
        'xstate/no-invalid-transition-props': 'error',
        'xstate/no-invalid-state-props': 'error',
        'xstate/no-invalid-conditional-action': 'error',
        'xstate/no-async-guard': 'error',
      },
    },
    // Requires: xstate@4
    recommended_v4: {
      settings: {
        xstate: {
          version: 4,
        },
      },
      plugins: ['xstate'],
      rules: {
        'xstate/spawn-usage': 'error',
        'xstate/no-infinite-loop': 'error',
        'xstate/no-imperative-action': 'error',
        'xstate/no-ondone-outside-compound-state': 'error',
        'xstate/invoke-usage': 'error',
        'xstate/entry-exit-action': 'error',
        'xstate/prefer-always': 'error',
        'xstate/prefer-predictable-action-arguments': 'warn',
        'xstate/no-misplaced-on-transition': 'error',
        'xstate/no-invalid-transition-props': 'error',
        'xstate/no-invalid-state-props': 'error',
        'xstate/no-invalid-conditional-action': 'error',
        'xstate/no-async-guard': 'error',
      },
    },
    // Requires: xstate@4
    all_v4: {
      settings: {
        xstate: {
          version: 4,
        },
      },
      plugins: ['xstate'],
      rules: {
        'xstate/spawn-usage': 'error',
        'xstate/no-infinite-loop': 'error',
        'xstate/no-imperative-action': 'error',
        'xstate/no-ondone-outside-compound-state': 'error',
        'xstate/invoke-usage': 'error',
        'xstate/entry-exit-action': 'error',
        'xstate/event-names': ['warn', 'macroCase'],
        'xstate/state-names': ['warn', 'camelCase'],
        'xstate/no-inline-implementation': 'warn',
        'xstate/no-auto-forward': 'warn',
        'xstate/prefer-always': 'error',
        'xstate/prefer-predictable-action-arguments': 'warn',
        'xstate/no-misplaced-on-transition': 'error',
        'xstate/no-invalid-transition-props': 'error',
        'xstate/no-invalid-state-props': 'error',
        'xstate/no-invalid-conditional-action': 'error',
        'xstate/no-async-guard': 'error',
      },
    },
  },
}
