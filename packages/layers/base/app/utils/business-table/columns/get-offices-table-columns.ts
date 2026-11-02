export function getOfficesTableColumns<T extends OfficesSchema = OfficesSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>,
  invalidAddressLabel?: string
): TableBusinessColumn<T>[] {
  const typeColumn = getOfficeTypeColumn<T>('first', badgeLabelOverrides)
  const deliveryColumn = getDeliveryAddressColumn<T>('default', invalidAddressLabel)
  const mailingColumn = getMailingAddressColumn<T>('default', invalidAddressLabel)
  const actionsColumn = getActionsColumn<T>()

  const officesColumns: TableBusinessColumn<T>[] = [
    typeColumn,
    mailingColumn,
    deliveryColumn,
    actionsColumn
  ]

  return officesColumns
}
