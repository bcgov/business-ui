export function getPartyTableColumns<T extends PartyStateBase = PartyStateBase>(): TableBusinessColumn<T>[] {
  const nameColumn = getNameColumn<T>()
  const deliveryColumn = getDeliveryAddressColumn<T>()
  const mailingColumn = getMailingAddressColumn<T>()
  const actionsColumn = getActionsColumn<T>()

  const partyColumns: TableBusinessColumn<T>[] = [
    nameColumn,
    deliveryColumn,
    mailingColumn,
    actionsColumn
  ]

  return partyColumns
}
