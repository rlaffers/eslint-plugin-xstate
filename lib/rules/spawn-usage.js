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

    function captureSpawnIdentifierFromXStateMemberExpression(node) {
      if (
        xstateIdentifier != null &&
        node.init.object.name === xstateIdentifier
      ) {
        spawnIdentifiers.push(node.id.name)
      }
    }

    return {
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
      // commonjs imports
      // const { spawn } = require('xstate')
      // const { spawn: xspawn } = require('xstate')
      // const xstate = require('xstate')
      'VariableDeclarator[init.callee.name="require"][init.arguments.0.value="xstate"]':
        function (node) {
          if (xstateIdentifier !== null || spawnIdentifiers.length > 0) {
            return
          }
          if (node.id.type === 'ObjectPattern') {
            const spawnProperty = node.id.properties.find(
              (p) => p.key.name === 'spawn'
            )
            if (spawnProperty) {
              spawnIdentifiers.push(spawnProperty.value.name)
            }
            return
          }
          if (node.id.type === 'Identifier') {
            xstateIdentifier = node.id.name
          }
        },
      // const spawn = require('xstate').spawn
      // const spawn = require('xstate')['spawn']
      'VariableDeclarator[init.object.callee.name="require"][init.object.arguments.0.value="xstate"]':
        function (node) {
          if (
            node.init.property.name === 'spawn' ||
            node.init.property.value === 'spawn'
          ) {
            spawnIdentifiers.push(node.id.name)
          }
        },
      // const { spawn } = xstate
      // Ignores it if the xstateIdentifier has not been previously resolved
      'VariableDeclarator[id.type="ObjectPattern"] > ObjectPattern > Property[key.name="spawn"]':
        function (node) {
          const varDeclarator = node.parent.parent
          if (
            xstateIdentifier != null &&
            xstateIdentifier === varDeclarator.init.name
          ) {
            spawnIdentifiers.push(node.value.name)
          }
        },
      // const spawn = xstate.spawn
      // const spawn = xstate['spawn']
      'VariableDeclarator[init.type="MemberExpression"][init.property.name="spawn"]':
        captureSpawnIdentifierFromXStateMemberExpression,
      'VariableDeclarator[init.type="MemberExpression"][init.property.value="spawn"]':
        captureSpawnIdentifierFromXStateMemberExpression,
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
          (node.callee.property.name === 'spawn' ||
            node.callee.property.value === 'spawn')
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
