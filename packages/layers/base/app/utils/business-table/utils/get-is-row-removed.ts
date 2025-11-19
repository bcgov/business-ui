/**
  * Returns true if the given row's actions include "ActionType.REMOVED"
*/
export function getIsRowRemoved<T extends { actions: ActionType[] }>(row: TableBusinessRow<T>): boolean {
  return row.original.new.actions.includes(ActionType.REMOVED)
}
