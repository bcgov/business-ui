import { TableColumnIdentity } from '#components'
import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'

export function getCourtOrderNumberColumn<T extends CourtOrderPoaFullSchema>(
  metaOption: TableColumnMetaOption = 'first',
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const column: TableBusinessColumn<T> = {
    id: 'court-order-number',
    header: t('label.courtOrder#'),
    meta,
    cell: ({ row }) => {
      const badges = getTableBadges(row, badgeLabelOverrides)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-36 max-w-36 font-bold'

      return h(
        TableColumnIdentity,
        {
          label: `#${row.original.new.fileNumber}`,
          badges,
          class: defaultClass,
          labelClass: isRemoved ? DELETED_CLASS : ''
        }
      )
    }
  }

  return column
}
