export function getPartyTableColumns<T extends PartySchema = PartySchema>(
  columns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'actions'],
  badgeLabelOverrides?: Partial<Record<ActionType, string>>,
  showFormerName = true,
  headerOverrides?: Partial<Record<TablePartyColumnName, string>>,
  columnOptions?: TablePartyColumnOptions
): TableBusinessColumn<T>[] {
  const columnMap: Record<TablePartyColumnName, TableBusinessColumn<T>> = {
    name: getPartyNameColumn<T>('first', badgeLabelOverrides, showFormerName),
    roles: getPartyRolesColumn<T>(),
    delivery: getDeliveryAddressColumn<T>(),
    mailing: getMailingAddressColumn<T>(),
    effectiveDates: getEffectiveDatesColumn<T>('default', columnOptions?.effectiveDates),
    email: getEmailColumn<T>(),
    actions: getActionsColumn<T>()
  }

  return columns.map((c) => {
    const column = columnMap[c]
    const header = headerOverrides?.[c]
    return header ? { ...column, header } : column
  })
}
