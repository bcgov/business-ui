import { TableColumnIdentity } from '#components'
import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'

export function getBusinessNameColumn<T extends AmalgamationTableRow>(
  metaOption: TableColumnMetaOption = 'first',
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const nameColumn: TableBusinessColumn<T> = {
    id: 'business-name-column',
    header: t('label.businessName'),
    meta,
    cell: ({ row }) => {
      const badges = getTableBadges(row, badgeLabelOverrides)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'font-bold min-w-40 max-w-40 flex flex-col gap-2'

      const name = row.original.new.name
      const number = row.original.new.number

      return h(
        TableColumnIdentity,
        {
          label: name,
          badges,
          class: [defaultClass, isRemoved ? DELETED_CLASS : ''],
          labelClass: isRemoved ? DELETED_CLASS : ''
        },
        {
          'additional-label': () => h('span', { class: 'text-sm font-normal' }, number)
        }
      )
    }
  }

  return nameColumn
}
