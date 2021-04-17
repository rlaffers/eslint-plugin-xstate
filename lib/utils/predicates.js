const { allPass, complement } = require('./combinators')

function isFirstArrayItem(node) {
  return (
    node.parent.type === 'ArrayExpression' && node.parent.elements[0] === node
  )
}

const propertyHasName = (propName) => (node) => node.key.name === propName
const propertyValueIsNil = (node) =>
  (node.type === 'Literal' && node.value.value === undefined) ||
  (node.type === 'Identifier' && node.name === 'undefined')

function hasProperty(propName, node) {
  return (
    node.type === 'ObjectExpression' &&
    node.properties.some(
      allPass([propertyHasName(propName), complement(propertyValueIsNil)])
    )
  )
}

function isFunctionExpression(node) {
  return (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  )
}

function isIIFE(node) {
  const parent = node.parent
  return (
    isFunctionExpression(node) &&
    parent &&
    parent.type === 'CallExpression' &&
    parent.callee === node
  )
}

function isStringLiteral(node) {
  return node.type === 'Literal' && typeof node.value === 'string'
}

function isIdentifier(node) {
  return node.type === 'Identifier' && node.name !== 'undefined'
}

function isStringLiteralOrIdentifier(node) {
  return isStringLiteral(node) || isIdentifier(node)
}

module.exports = {
  isFirstArrayItem,
  propertyHasName,
  hasProperty,
  isFunctionExpression,
  isIIFE,
  isStringLiteralOrIdentifier,
  isIdentifier,
  isStringLiteral,
}
