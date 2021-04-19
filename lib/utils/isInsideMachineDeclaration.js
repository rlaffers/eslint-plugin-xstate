const { isCreateMachineCall } = require('./predicates')

module.exports = function isInsideMachineDeclaration(node) {
  let parent = node.parent
  while (parent) {
    if (isCreateMachineCall(parent)) {
      return true
    }
    parent = parent.parent
  }
  return false
}
