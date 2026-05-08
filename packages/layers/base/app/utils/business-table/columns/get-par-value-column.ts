import { h } from 'vue'
import { DELETED_CLASS } from './constants'

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
      const defaultClass = 'min-w-40 max-w-40 overflow-clip'

      const parValue = row.original.new.parValue
      const displayText = parValue
        ? formatCurrency(parValue, row.original.new.currency ?? '', 6)
        : t('label.noParValue')

      return h(
        'span',
        {
          class: [defaultClass, (isRowRemoved || isParentRowRemoved) ? DELETED_CLASS : '']
        },
        displayText
      )
    }
  }

  return maxColumn
}
