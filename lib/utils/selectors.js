const { propertyHasName } = require('./predicates')

function getTypeProperty(node) {
  if (node.type !== 'ObjectExpression') {
    return null
  }
  return node.properties.find(propertyHasName('type'))
}

module.exports = {
  getTypeProperty,
}
