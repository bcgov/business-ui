export function getIsExistingRecord<T>(
  record: TableBusinessRow<T>
): record is TableBusinessRow<T> & { original: { old: T } } {
  return record.original.old !== undefined
}
