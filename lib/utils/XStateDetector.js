/**
 * XStateDetector can be used to capture information about xstate imports.
 */
module.exports = class XStateDetector {
  constructor() {
    this.xstateIdentifier = null
    this.spawnIdentifiers = []

    const captureSpawnIdentifierFromXStateMemberExpression = (node) => {
      if (
        this.xstateIdentifier != null &&
        node.init.object.name === this.xstateIdentifier
      ) {
        this.spawnIdentifiers.push(node.id.name)
      }
    }

    this.visitors = {
      'ImportDeclaration[source.value="xstate"]': (node) => {
        const importSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportSpecifier' && s.imported.name === 'spawn'
        )
        if (importSpecifier) {
          this.spawnIdentifiers.push(importSpecifier.local.name)
          return
        }
        const importDefaultSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportDefaultSpecifier'
        )
        if (importDefaultSpecifier) {
          this.xstateIdentifier = importDefaultSpecifier.local.name
          return
        }
        const importNamespaceSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportNamespaceSpecifier'
        )
        if (importNamespaceSpecifier) {
          this.xstateIdentifier = importNamespaceSpecifier.local.name
        }
      },
      // commonjs imports
      // const { spawn } = require('xstate')
      // const { spawn: xspawn } = require('xstate')
      // const xstate = require('xstate')
      'VariableDeclarator[init.callee.name="require"][init.arguments.0.value="xstate"]':
        (node) => {
          if (
            this.xstateIdentifier !== null ||
            this.spawnIdentifiers.length > 0
          ) {
            return
          }
          if (node.id.type === 'ObjectPattern') {
            const spawnProperty = node.id.properties.find(
              (p) => p.key.name === 'spawn'
            )
            if (spawnProperty) {
              this.spawnIdentifiers.push(spawnProperty.value.name)
            }
            return
          }
          if (node.id.type === 'Identifier') {
            this.xstateIdentifier = node.id.name
          }
        },
      // const spawn = require('xstate').spawn
      // const spawn = require('xstate')['spawn']
      'VariableDeclarator[init.object.callee.name="require"][init.object.arguments.0.value="xstate"]':
        (node) => {
          if (
            node.init.property.name === 'spawn' ||
            node.init.property.value === 'spawn'
          ) {
            this.spawnIdentifiers.push(node.id.name)
          }
        },
      // const { spawn } = xstate
      // Ignores it if the xstateIdentifier has not been previously resolved
      'VariableDeclarator[id.type="ObjectPattern"] > ObjectPattern > Property[key.name="spawn"]':
        (node) => {
          const varDeclarator = node.parent.parent
          if (
            this.xstateIdentifier != null &&
            this.xstateIdentifier === varDeclarator.init.name
          ) {
            this.spawnIdentifiers.push(node.value.name)
          }
        },
      // const spawn = xstate.spawn
      // const spawn = xstate['spawn']
      'VariableDeclarator[init.type="MemberExpression"][init.property.name="spawn"]':
        captureSpawnIdentifierFromXStateMemberExpression,
      'VariableDeclarator[init.type="MemberExpression"][init.property.value="spawn"]':
        captureSpawnIdentifierFromXStateMemberExpression,
    }
  }

  isSpawnCallExpression(node) {
    if (this.spawnIdentifiers.length < 1 && this.xstateIdentifier == null) {
      return false
    }
    return (
      (node.callee.type === 'Identifier' &&
        this.spawnIdentifiers.includes(node.callee.name)) ||
      (node.callee.type === 'MemberExpression' &&
        node.callee.object.name === this.xstateIdentifier &&
        (node.callee.property.name === 'spawn' ||
          node.callee.property.value === 'spawn'))
    )
  }
}
