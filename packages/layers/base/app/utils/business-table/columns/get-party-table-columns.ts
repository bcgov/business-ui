export function getPartyTableColumns<T extends PartySchema = PartySchema>(
  columns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'actions'],
  badgeLabelOverrides?: Partial<Record<ActionType, string>>,
  showFormerName = true
): TableBusinessColumn<T>[] {
  const columnMap: Record<TablePartyColumnName, TableBusinessColumn<T>> = {
    name: getPartyNameColumn<T>('first', badgeLabelOverrides, showFormerName),
    roles: getPartyRolesColumn<T>(),
    delivery: getDeliveryAddressColumn<T>(),
    mailing: getMailingAddressColumn<T>(),
    effectiveDates: getEffectiveDatesColumn<T>(),
    email: getEmailColumn<T>(),
    actions: getActionsColumn<T>()
  }

  return columns.map(c => columnMap[c])
}
