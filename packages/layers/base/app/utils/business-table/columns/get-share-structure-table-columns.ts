export function getShareStructureTableColumns<
  T extends ShareClassSchema = ShareClassSchema
>(): TableBusinessColumn<T>[] {
  const nameColumn = getShareClassOrSeriesNameColumn<T>()
  // const typeColumn = getOfficeTypeColumn<T>()
  // const deliveryColumn = getDeliveryAddressColumn<T>()
  // const mailingColumn = getMailingAddressColumn<T>()
  // const actionsColumn = getActionsColumn<T>()

  const shareStructureColumns: TableBusinessColumn<T>[] = [
    nameColumn
    // deliveryColumn,
    // mailingColumn,
    // actionsColumn
  ]

  return shareStructureColumns
}
