const { getParentFunctionExpression } = require('./selectors')

module.exports = function isSpawnFromParametersCallExpresion(node) {
  const functionNode = getParentFunctionExpression(node)
  if (!functionNode) {
    return false
  }

  if (!functionNode.params[0]) {
    return false
  }

  // populated when there is a destructured object for params
  let spawnIdentifier = null
  // populated when the whole first arg object is grabbed
  let firstArgIdentifier = null

  if (functionNode.params[0].type === 'Identifier') {
    firstArgIdentifier = functionNode.params[0].name
  } else if (functionNode.params[0].type === 'ObjectPattern') {
    const spawnProperty = functionNode.params[0].properties.find(
      (property) => property.key.name === 'spawn'
    )
    if (!spawnProperty) {
      return false
    }
    spawnIdentifier = spawnProperty.value.name
  } else {
    return false
  }

  return (
    (node.callee.type === 'Identifier' &&
      node.callee.name === spawnIdentifier) ||
    (node.callee.type === 'MemberExpression' &&
      node.callee.object.name === firstArgIdentifier &&
      (node.callee.property.name === 'spawn' ||
        node.callee.property.value === 'spawn'))
  )
}
