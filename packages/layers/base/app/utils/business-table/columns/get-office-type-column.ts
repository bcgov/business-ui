import { TableColumnOfficeType } from '#components'
import { h } from 'vue'

export function getOfficeTypeColumn<T extends { type: OfficeType, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'first'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const officeColumn: TableBusinessColumn<T> = {
    id: 'office-type',
    header: t('label.office'),
    meta,
    cell: ({ row }) => {
      const badges = getTableBadges(row)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'font-bold min-w-48 max-w-48 flex flex-col gap-2'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      return h(
        TableColumnOfficeType,
        {
          type: row.original.new.type,
          badges,
          class: cellClass
        },
        () => []
      )
    }
  }

  return officeColumn
}
