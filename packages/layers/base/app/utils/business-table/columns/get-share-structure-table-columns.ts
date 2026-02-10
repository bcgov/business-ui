export function getShareStructureTableColumns<
  T extends ShareClassSchema = ShareClassSchema
>(): TableBusinessColumn<T>[] {
  const nameColumn = getShareClassOrSeriesNameColumn<T>()
  const maxColumn = getMaxNumberOfSharesColumn<T>()
  const parValueColumn = getParValueColumn<T>()
  const currencyColumn = getCurrencyColumn<T>()
  const rorColumn = getSpecialRightsOrRestrictionsColumn<T>()
  const actionsColumn = getActionsColumn<T>()

  const shareStructureColumns: TableBusinessColumn<T>[] = [
    {
      id: 'priority',
      // required for table sorting
      // series rows will have the 'new' property since we are adding it in the get-sub-rows prop
      accessorKey: 'new.priority'
    },
    nameColumn,
    maxColumn,
    parValueColumn,
    currencyColumn,
    rorColumn,
    actionsColumn
  ]

  return shareStructureColumns
}
