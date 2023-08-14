module.exports = {
  withVersion(version, testCase) {
    if (typeof testCase === 'string') {
      return {
        code: testCase,
        settings: {
          xstate: {
            version,
          },
        },
      }
    }
    return {
      ...testCase,
      settings: {
        xstate: {
          version,
        },
      },
    }
  },
}
