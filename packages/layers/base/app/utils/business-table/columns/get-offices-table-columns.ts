export function getOfficesTableColumns<T extends OfficesSchema = OfficesSchema>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const typeColumn = getOfficeTypeColumn<T>('first', badgeLabelOverrides)
  const deliveryColumn = getDeliveryAddressColumn<T>()
  const mailingColumn = getMailingAddressColumn<T>()
  const actionsColumn = getActionsColumn<T>()

  const officesColumns: TableBusinessColumn<T>[] = [
    typeColumn,
    mailingColumn,
    deliveryColumn,
    actionsColumn
  ]

  return officesColumns
}
