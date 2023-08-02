'use strict'

const getDocsUrl = require('../utils/getDocsUrl')

const { isFunctionExpression, isIIFE } = require('../utils/predicates')

function isAssignCall(node) {
  return node.type === 'CallExpression' && node.callee.name === 'assign'
}

function isInsideAssignCall(node) {
  let parent = node.parent
  while (parent) {
    if (isAssignCall(parent)) {
      return true
    }
    parent = parent.parent
  }
  return false
}

function isInsideAssignerFunction(node) {
  let parent = node.parent
  while (parent) {
    if (isFunctionExpression(parent) && !isIIFE(parent)) {
      // now search for an assign call ancestor
      return isInsideAssignCall(parent)
    }
    // if there is this assign call without function descdendant, its bad
    if (isAssignCall(parent)) {
      return false
    }
    // TODO it's possible that a function expression inside assigner function
    // does not get called, so nothing is ever spawned
    parent = parent.parent
  }
  return false
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce correct usage of spawn function',
      category: 'Possible Errors',
      url: getDocsUrl('spawn-usage'),
      recommended: true,
    },
    schema: [],
    messages: {
      invalidCallContext:
        'Function "spawn" cannot be called outside of an assignment function.',
    },
  },

  create: function (context) {
    // This will remain empty unless spawn is imported from the XState library
    const spawnIdentifiers = []
    // This may get populated if the whole xstate module is imported
    let xstateIdentifier = null

    return {
      // TODO support commonjs imports
      // TODO support dynamic import()
      'ImportDeclaration[source.value="xstate"]': function (node) {
        const importSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportSpecifier' && s.imported.name === 'spawn'
        )
        if (importSpecifier) {
          spawnIdentifiers.push(importSpecifier.local.name)
          return
        }
        const importDefaultSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportDefaultSpecifier'
        )
        if (importDefaultSpecifier) {
          xstateIdentifier = importDefaultSpecifier.local.name
          return
        }
        const importNamespaceSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportNamespaceSpecifier'
        )
        if (importNamespaceSpecifier) {
          xstateIdentifier = importNamespaceSpecifier.local.name
        }
      },
      // visits: const { spawn } = xstate
      // Ignores it if the xstateIdentifier has not been previously resolved
      'VariableDeclarator[id.type="ObjectPattern"] > ObjectPattern > Property[key.name="spawn"]':
        function (node) {
          const varDeclarator = node.parent.parent
          if (
            xstateIdentifier == null ||
            xstateIdentifier !== varDeclarator.init.name
          ) {
            return
          }
          spawnIdentifiers.push(node.value.name)
        },
      // visits: const spawn = xstate.spawn
      // Ignores it is xstateIdentifier has not been previously resolved
      'VariableDeclarator[init.type="MemberExpression"][init.property.name="spawn"]':
        function (node) {
          if (
            xstateIdentifier == null ||
            node.init.object.name !== xstateIdentifier
          ) {
            return
          }
          spawnIdentifiers.push(node.id.name)
        },
      // Ignores it if the spawnIdentifier has not been previously resolved to "spawn" (imported from xstate)
      CallExpression: function (node) {
        if (spawnIdentifiers.length < 1 && xstateIdentifier == null) {
          return
        }

        if (
          node.callee.type === 'Identifier' &&
          spawnIdentifiers.includes(node.callee.name)
        ) {
          if (!isInsideAssignerFunction(node)) {
            context.report({
              node,
              messageId: 'invalidCallContext',
            })
          }
          return
        }
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === xstateIdentifier &&
          node.callee.property.name === 'spawn'
        ) {
          if (!isInsideAssignerFunction(node)) {
            context.report({
              node,
              messageId: 'invalidCallContext',
            })
          }
        }
      },
    }
  },
}
