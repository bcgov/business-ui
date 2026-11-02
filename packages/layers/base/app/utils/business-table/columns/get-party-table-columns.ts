export function getPartyTableColumns<T extends PartySchema = PartySchema>(
  columns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'actions'],
  badgeLabelOverrides?: Partial<Record<ActionType, string>>,
  showFormerName = true,
  invalidAddressLabel?: string
): TableBusinessColumn<T>[] {
  const columnMap: Record<TablePartyColumnName, TableBusinessColumn<T>> = {
    name: getPartyNameColumn<T>('first', badgeLabelOverrides, showFormerName),
    roles: getPartyRolesColumn<T>(),
    delivery: getDeliveryAddressColumn<T>('default', invalidAddressLabel),
    mailing: getMailingAddressColumn<T>('default', invalidAddressLabel),
    effectiveDates: getEffectiveDatesColumn<T>(),
    email: getEmailColumn<T>(),
    actions: getActionsColumn<T>()
  }

  return columns.map(c => columnMap[c])
}
