const isXStateLintingEnforced = require('./isXStateLintingEnforced')

module.exports = function getSelectorPrefix(sourceCode) {
  return isXStateLintingEnforced(sourceCode)
    ? ''
    : 'CallExpression[callee.name=/^createMachine$|^Machine$/] '
}
