const { allPass, complement } = require('./combinators')

function isFirstArrayItem(node) {
  return (
    node.parent.type === 'ArrayExpression' && node.parent.elements[0] === node
  )
}

const propertyHasName = (propName) => (node) => node.key.name === propName
// matches only literal values (string, number, boolean, null)
const propertyHasValue = (value) => (node) =>
  node.value.type === 'Literal' && node.value.value === value

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

function isCreateMachineCall(node) {
  return (
    node.type === 'CallExpression' &&
    (node.callee.name === 'createMachine' || node.callee.name === 'Machine')
  )
}

function isCallExpression(node) {
  return node.type === 'CallExpression'
}

function isArrayExpression(node) {
  return node.type === 'ArrayExpression'
}

function isObjectExpression(node) {
  return node.type === 'ObjectExpression'
}

const actionCreators = {
  4: [
    'assign',
    'cancel',
    'choose',
    'done',
    'doneInvoke',
    'error',
    'escalate',
    'forwardTo',
    'log',
    'pure',
    'raise',
    'respond',
    'send',
    'sendParent',
    'sendTo',
    'sendUpdate',
    'start',
    'stop',
  ],
  5: [
    'assign',
    'cancel',
    'choose',
    'done',
    'doneInvoke',
    'error',
    'escalate',
    'forwardTo',
    'log',
    'pure',
    'raise',
    'sendParent',
    'sendTo',
    'stop',
  ],
}

function isKnownActionCreatorName(name, version) {
  return actionCreators[version] && actionCreators[version].includes(name)
}

function isKnownActionCreatorCall(node, version) {
  return (
    (node.type === 'CallExpression' &&
      isKnownActionCreatorName(node.callee.name, version)) ||
    (node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'actions' &&
      isKnownActionCreatorName(node.callee.property.name, version))
  )
}

function isWithinInvoke(property) {
  const parentProp = property.parent.parent
  if (
    parentProp &&
    parentProp.type === 'Property' &&
    parentProp.key.name === 'invoke'
  ) {
    return true
  }
  return (
    parentProp.type === 'ArrayExpression' &&
    parentProp.parent &&
    parentProp.parent.type === 'Property' &&
    parentProp.parent.key.name === 'invoke'
  )
}

function isWithinNode(node, predicate, stop = () => false) {
  let current = node.parent
  while (true) {
    if (!current) {
      return false
    }
    if (predicate(current)) {
      return true
    }
    if (stop(current)) {
      return false
    }
    current = current.parent
  }
}

// list of property names which have special meaning to XState in some contexts (they are
// part of the XState's API)
const reservedWords = [
  'on',
  'src',
  'onDone',
  'onError',
  'id',
  'after',
  'type',
  'cond',
  'actions',
  'activities',
  'in',
  'invoke',
  'meta',
  'always',
  'initial',
  'entry',
  'exit',
  'context',
  'states',
  'tags',
]
function isReservedXStateWord(string) {
  return reservedWords.includes(string)
}

function isAssignActionCreatorCall(node) {
  return node.type === 'CallExpression' && node.callee.name === 'assign'
}

module.exports = {
  isFirstArrayItem,
  propertyHasName,
  propertyHasValue,
  hasProperty,
  isFunctionExpression,
  isIIFE,
  isStringLiteralOrIdentifier,
  isIdentifier,
  isStringLiteral,
  isCreateMachineCall,
  isCallExpression,
  isArrayExpression,
  isObjectExpression,
  isKnownActionCreatorCall,
  isWithinInvoke,
  isReservedXStateWord,
  isAssignActionCreatorCall,
  isWithinNode,
}
