import { isEqual, omit } from 'es-toolkit'

/**
 * Deep equal two objects while omitting certain keys.
 *
 * @param objA The first object to compare
 * @param objB The second object to compare
 * @param keys Keys to omit
*/
export function isEqualOmit<T extends object>(
  objA: T,
  objB: T,
  keys: Array<keyof T>
): boolean {
  // null/undefined check
  if (!objA || !objB) {
    return objA === objB
  }

  return isEqual(omit(objA, keys), omit(objB, keys))
}
