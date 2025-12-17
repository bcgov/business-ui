import { TableColumnName } from '#components'
import { h } from 'vue'

export function getNameColumn<T extends { name: PartyNameSchema, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'first'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const nameColumn: TableBusinessColumn<T> = {
    id: 'name',
    header: t('label.name'),
    meta,
    cell: ({ row }) => {
      const badges = getTableBadges(row)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'font-bold min-w-48 max-w-48 flex flex-col gap-2'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      return h(
        TableColumnName,
        {
          party: row.original.new.name,
          badges,
          class: cellClass
        },
        () => []
      )
    }
  }

  return nameColumn
}
