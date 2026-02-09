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
      accessorKey: 'priority' // must include here to use the table ordering
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
