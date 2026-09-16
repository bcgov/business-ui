export function getExpandedFormVariant<T>(
  managerVariant: ManageVariant,
  row: TableBusinessRow<T>
): FormVariant {
  // old is always undefined for newly added items
  const isAdded = row.original.old === undefined
  if (isAdded) {
    return 'edit'
  }
  if (managerVariant === 'correct') {
    return 'correct'
  }
  return 'change'
}
