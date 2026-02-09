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
      // accessorKey: 'new.priority'
      accessorFn: (row) => {
        return 'new' in row ? row.new.priority : (row as unknown as ShareSeriesSchema).priority
      }
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
