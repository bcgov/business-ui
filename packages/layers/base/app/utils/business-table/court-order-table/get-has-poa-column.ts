import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'

export function getHasPoaColumn<T extends CourtOrderPoaFullSchema>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const column: TableBusinessColumn<T> = {
    id: 'court-order-has-poa',
    header: t('label.planOfArrangement'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-36 max-w-36'

      const text = row.original.new.effectOfOrder ? t('label.yes') : t('label.no')

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
