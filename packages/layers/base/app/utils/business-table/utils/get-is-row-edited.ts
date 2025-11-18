import { isEqual } from 'es-toolkit'

/**
  * Returns true if the given row's old state is not undefined and the old and new state are different
*/
export function getIsRowEdited<T = unknown>(row: TableBusinessRow<T>): boolean {
  const oldVal = row.original.old
  const newVal = row.original.new
  return !!(oldVal && !isEqual(oldVal, newVal))
}
