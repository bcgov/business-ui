export function getOfficesTableColumns<T extends OfficesSchema = OfficesSchema>(): TableBusinessColumn<T>[] {
  const typeColumn = getOfficeTypeColumn<T>()
  const deliveryColumn = getDeliveryAddressColumn<T>()
  const mailingColumn = getMailingAddressColumn<T>()
  const actionsColumn = getActionsColumn<T>()

  const officesColumns: TableBusinessColumn<T>[] = [
    typeColumn,
    deliveryColumn,
    mailingColumn,
    actionsColumn
  ]

  return officesColumns
}
