/**
  * Returns true if the given row's actions have any action other than 'ADDED'
*/
export function getIsRowEdited<T extends { actions: ActionType[] }>(row: TableBusinessRow<T>): boolean {
  const actions = row.original.new.actions
  return actions.length > 0 && !actions.includes(ActionType.ADDED)
}
