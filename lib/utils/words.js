const unicodeWords = require('./unicodeWords')

/** Used to match words composed of alphanumeric characters. */
// eslint-disable-next-line no-control-regex
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g

function asciiWords(string) {
  return string.match(reAsciiWord)
}

const hasUnicodeWord = (string) =>
  /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/.test(string)

module.exports = function words(string) {
  const result = hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string)
  return result || []
}
