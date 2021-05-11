'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const {
  hasProperty,
  propertyHasName,
  isStringLiteralOrIdentifier,
  isFunctionExpression,
  isCreateMachineCall,
} = require('../utils/predicates')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce correct invocation of services',
      category: 'Possible Errors',
      url: getDocsUrl('invoke-usage'),
      recommended: true,
    },
    schema: [],
    messages: {
      invokeIsNotObject:
        'The value of the "invoke" property must be an object with a "src" property.',
      invokeObjectLacksSrc: 'The "invoke" object must have a "src" property.',
      srcPropertyIsInvalid:
        'The value of the "src" property in the "invoke" object must be a machine, function, string or an object.',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="invoke"]':
        function (node) {
          if (node.value.type !== 'ObjectExpression') {
            context.report({
              node,
              messageId: 'invokeIsNotObject',
            })
            return
          }
          if (!hasProperty('src', node.value)) {
            context.report({
              node,
              messageId: 'invokeObjectLacksSrc',
            })
            return
          }
          const src = node.value.properties.find(propertyHasName('src'))
          if (
            !isStringLiteralOrIdentifier(src.value) &&
            !isFunctionExpression(src.value) &&
            src.value.type !== 'ObjectExpression' &&
            !isCreateMachineCall(src.value)
          ) {
            context.report({
              node: src,
              messageId: 'srcPropertyIsInvalid',
            })
          }
        },
    }
  },
}
