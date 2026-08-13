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
export function isEqualOmit<T extends object>(
  objA: T,
  objB: T,
  keys: ReadonlyArray<keyof T>
): boolean {
  // null/undefined check
  if (!objA || !objB) {
    return objA === objB
  }

  return isEqual(omit(objA, keys), omit(objB, keys))
}
