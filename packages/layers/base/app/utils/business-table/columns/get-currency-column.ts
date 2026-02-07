import { h } from 'vue'

export function getCurrencyColumn<T extends ShareClassSchema>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const maxColumn: TableBusinessColumn<T> = {
    id: 'currency',
    header: t('label.currency'),
    meta,
    cell: ({ row }) => {
      const isSeries = row.depth === 1
      // series row styling can change based on parent row removed action
      const isRowRemoved = getIsRowRemoved(row)
      const isParentRowRemoved = isSeries && getIsRowRemoved(row.getParentRow()!)

      const defaultClass = 'min-w-48 max-w-48 overflow-clip'
      // apply opacity whether the current or parent row is removed
      const cellClass = (isRowRemoved || isParentRowRemoved) ? defaultClass + ' opacity-50' : defaultClass

      // TODO/QUESTION: only display currency if par value is defined?
      const currency = row.original.new.currency
      const displayText = currency
        ? currency
        : ''

      return h(
        'span',
        {
          class: cellClass
        },
        displayText
      )
    }
  }

  return maxColumn
}
