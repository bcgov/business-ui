export function getPartyTableColumns<T extends PartySchema = PartySchema>(
  columns: TablePartyColumnName[] = ['name', 'delivery', 'mailing', 'actions']
): TableBusinessColumn<T>[] {
  const columnMap: Record<TablePartyColumnName, TableBusinessColumn<T>> = {
    name: getNameColumn<T>(),
    delivery: getDeliveryAddressColumn<T>(),
    mailing: getMailingAddressColumn<T>(),
    effectiveDates: getEffectiveDatesColumn<T>(),
    actions: getActionsColumn<T>()
  }

  return columns.map(c => columnMap[c])
}
