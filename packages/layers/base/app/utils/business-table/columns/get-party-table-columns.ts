export function getPartyTableColumns<T extends PartySchema = PartySchema>(
  columns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'actions'],
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const columnMap: Record<TablePartyColumnName, TableBusinessColumn<T>> = {
    name: getPartyNameColumn<T>('first', badgeLabelOverrides),
    roles: getPartyRolesColumn<T>(),
    delivery: getDeliveryAddressColumn<T>(),
    mailing: getMailingAddressColumn<T>(),
    effectiveDates: getEffectiveDatesColumn<T>(),
    actions: getActionsColumn<T>()
  }

  return columns.map(c => columnMap[c])
}
