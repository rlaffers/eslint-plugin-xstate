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
        'Invoke declarations cannot contain "on" transitions. The "on" transition declarations must be placed inside state nodes.',
      onTransitionInsideStatesForbidden:
        'The "states" declarations cannot contain "on" transitions. The "on" transition declarations must be placed inside state nodes.',
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
