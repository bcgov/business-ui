export const compare = function (a: object, b: object): boolean {
  const keysToCompare = Object.keys({ ...a, ...b })
    .filter(key => ![null, undefined]
    .includes(a[key]) || ![null, undefined].includes(b[key]))
  let rv = true
  for (let i = 0; i < keysToCompare.length; i++) {
    if (typeof a[keysToCompare[i]] === 'object') {
      rv = rv && compare(a[keysToCompare[i]], b[keysToCompare[i]])
    } else {
      rv = rv && a[keysToCompare[i]] === b[keysToCompare[i]]
    }
    if (!rv) {
      break
    }
  }
  return rv
}
