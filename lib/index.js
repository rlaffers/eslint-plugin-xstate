/**
 * @fileoverview ESLint rules for XState
 * @author Richard Laffers
 */
'use strict'

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports = {
  rules: {
    'spawn-usage': require('./rules/spawn-usage'),
  },
  configs: {
    recommended: {
      plugins: ['xstate'],
      rules: {
        'xstate/spawn-usage': 'error',
      },
    },
  },
}
