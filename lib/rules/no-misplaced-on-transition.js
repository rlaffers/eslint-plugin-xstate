'use strict'

const getDocsUrl = require('../utils/getDocsUrl')
const { isWithinInvoke } = require('../utils/predicates')

function isWithinStatesDeclaration(node) {
  const parentProp = node.parent.parent
  return parentProp.type === 'Property' && parentProp.key.name === 'states'
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'forbid misplaced on transitions',
      category: 'Possible Errors',
      url: getDocsUrl('no-misplaced-on-transition'),
      recommended: true,
    },
    schema: [],
    messages: {
      onTransitionInsideInvokeForbidden:
        'The "on" transitions cannot be declared inside an "invoke" declaration. The "on" transition declaration must be placed inside a state node.',
      onTransitionInsideStatesForbidden:
        'The "on" transitions cannot be declared inside a "states" declaration. The "on" transition declaration must be placed inside a state node.',
    },
  },

  create: function (context) {
    return {
      'CallExpression[callee.name=/^createMachine$|^Machine$/] Property[key.name="on"]': function (
        node
      ) {
        if (isWithinInvoke(node)) {
          context.report({
            node,
            messageId: 'onTransitionInsideInvokeForbidden',
          })
          return
        }
        if (isWithinStatesDeclaration(node)) {
          context.report({
            node,
            messageId: 'onTransitionInsideStatesForbidden',
          })
        }
      },
    }
  },
}
