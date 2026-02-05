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
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48 overflow-clip'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

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
