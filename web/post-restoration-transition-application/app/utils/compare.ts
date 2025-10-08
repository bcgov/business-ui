export const compare = function (a: object, b: object): boolean {
  const keysToCompare = Object.keys({ ...a, ...b })
    .filter(key => ![null, undefined]
    .includes(a[key]) || ![null, undefined, ''].includes(b[key]))
  let rv = true
  for (const key of keysToCompare) {
    if (typeof a[key] === 'object') {
      rv = rv && compare(a[key], b[key])
    } else {
      rv = rv && a[key] === b[key]
    }
    if (!rv) {
      break
    }
  }
  return rv
}
