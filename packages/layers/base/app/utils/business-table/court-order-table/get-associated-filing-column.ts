import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'

export function getAssociatedFilingColumn<T extends CourtOrderPoaFullSchema>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const column: TableBusinessColumn<T> = {
    id: 'court-order-associated-filing',
    header: t('label.associatedFiling'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48 overflow-clip break-words'

      const text = row.original.new.filingType

      return h(
        'span',
        {
          class: [defaultClass, isRemoved ? DELETED_CLASS : '']
        },
        text
      )
    }
  }

  return column
}
