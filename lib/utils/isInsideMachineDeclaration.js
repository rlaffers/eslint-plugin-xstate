function isCreateMachineCall(node) {
  return (
    node.type === 'CallExpression' &&
    (node.callee.name === 'createMachine' || node.callee.name === 'Machine')
  )
}

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
