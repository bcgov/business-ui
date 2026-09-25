/**
  * Returns true if all of the given row's roles have a cessation date (and the row isn't being removed).
  * Rows without roles (e.g. offices) are never ceased.
*/
export function getIsRowCeased<T extends { roles?: PartyRoleSchema, actions: ActionType[] }>(
  row: TableBusinessRow<T> | undefined
): boolean {
  if (!row || getIsRowRemoved(row)) {
    return false
  }
  const roles = row.original.new.roles ?? []
  return roles.length > 0 && roles.every(role => !!role.cessationDate)
}
