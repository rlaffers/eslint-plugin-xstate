const { propertyHasName } = require('./predicates')

function getTypeProperty(node) {
  if (node.type !== 'ObjectExpression') {
    return null
  }
  return node.properties.find(propertyHasName('type'))
}

function getParentFunctionExpression(node) {
  let current = node.parent
  while (true) {
    if (!current) {
      return null
    }
    if (
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      return current
    }
    current = current.parent
  }
}

module.exports = {
  getTypeProperty,
  getParentFunctionExpression,
}
