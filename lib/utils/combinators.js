const allPass = (fns) => (x) => fns.every((f) => f(x))
const anyPass = (fns) => (x) => fns.some((f) => f(x))
const complement = (f) => (x) => !f(x)

module.exports = {
  allPass,
  anyPass,
  complement,
}
