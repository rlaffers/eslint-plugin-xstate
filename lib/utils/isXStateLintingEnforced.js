module.exports = function isXStateLintingEnforced(sourceCode) {
  return sourceCode.getAllComments().some(x => x.type === 'Block' && x.value === ' eslint-plugin-xstate-include ')
}
