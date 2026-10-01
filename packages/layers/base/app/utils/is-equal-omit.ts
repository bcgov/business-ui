import { isEqual, omit } from 'es-toolkit'

/**
 * Deep equal two objects while omitting certain keys.
 *
 * @param objA The first object to compare
 * @param objB The second object to compare
 * @param keys Keys to omit
 *
 * @example
 * const NON_EDITABLE_FIELDS = ['id', 'isEditing', 'actions'] as const
 *
 * const subjectA = { id: '123', name: 'Court Order', isEditing: true }
 * const subjectB = { id: '456', name: 'Court Order', isEditing: false }
 *
 * isEqualOmit(subjectA, subjectB, NON_EDITABLE_FIELDS) // returns true
*/
export function isEqualOmit<T>(
  objA: T,
  objB: T,
  keys: ReadonlyArray<keyof T | string>
): boolean {
  // null/undefined/non object check
  if (typeof objA !== 'object' || typeof objB !== 'object' || !objA || !objB) {
    return objA === objB
  }

  // return basic isEqual if no omit keys provided
  if (!keys || keys.length === 0) {
    return isEqual(objA, objB)
  }

  const ks = keys as ReadonlyArray<keyof T>

  return isEqual(omit(objA, ks), omit(objB, ks))
}
