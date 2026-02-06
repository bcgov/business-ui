import { h } from 'vue'

export function getParValueColumn<T extends ShareClassSchema>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const maxColumn: TableBusinessColumn<T> = {
    id: 'parValue',
    header: t('label.parValue'),
    meta,
    cell: ({ row }) => {
      const isSeries = row.depth === 1
      // series row styling can change based on parent row removed action
      const isRowRemoved = getIsRowRemoved(row)
      const isParentRowRemoved = isSeries && getIsRowRemoved(row.getParentRow()!)

      const defaultClass = 'min-w-48 max-w-48 overflow-clip'
      // apply opacity whether the current or parent row is removed
      const cellClass = (isRowRemoved || isParentRowRemoved) ? defaultClass + ' opacity-50' : defaultClass

      const parValue = row.original.new.parValue
      const displayText = parValue
        ? parValue
        : t('label.noParValue')

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
