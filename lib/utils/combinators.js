const allPass = (fns) => (x) => fns.every((f) => f(x))
const complement = (f) => (x) => !f(x)

module.exports = {
  allPass,
  complement,
}
