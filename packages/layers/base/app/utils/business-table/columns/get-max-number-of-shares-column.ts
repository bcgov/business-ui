import { h } from 'vue'
import { DELETED_CLASS } from './constants'

export function getMaxNumberOfSharesColumn<T extends ShareClassSchema>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const maxColumn: TableBusinessColumn<T> = {
    id: 'maxNumberOfShares',
    header: t('label.maxNumberOfShares'),
    meta,
    cell: ({ row }) => {
      const isSeries = row.depth === 1
      // series row styling can change based on parent row removed action
      const isRowRemoved = getIsRowRemoved(row)
      const isParentRowRemoved = isSeries && getIsRowRemoved(row.getParentRow()!)
      const defaultClass = 'min-w-40 max-w-40 overflow-clip'

      const max = row.original.new.maxNumberOfShares
      const displayText = max
        ? max
        : t('label.noMaximum')

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
