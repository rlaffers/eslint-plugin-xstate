function isFirstArrayItem(node) {
  return (
    node.parent.type === 'ArrayExpression' && node.parent.elements[0] === node
  )
}

const propertyHasName = (propName) => (node) => node.key.name === propName

function hasProperty(propName, node) {
  return (
    node.type === 'ObjectExpression' &&
    node.properties.some(propertyHasName(propName))
  )
}

module.exports = {
  isFirstArrayItem,
  propertyHasName,
  hasProperty,
}
