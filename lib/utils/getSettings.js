'use strict'

const defaults = {
  version: 5,
}

const supportedVersions = [4, 5]

module.exports = function getSettings(context) {
  const settings = {
    ...defaults,
    ...(context.settings ? context.settings.xstate : undefined),
  }

  if (!supportedVersions.includes(settings.version)) {
    throw new Error(
      `XState version "${settings.version}" is not supported. Check "settings.xstate.version" in your ESLint config.`
    )
  }
  return settings
}
