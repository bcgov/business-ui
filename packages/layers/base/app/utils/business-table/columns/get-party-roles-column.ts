import { TableColumnRoles } from '#components'
import { h } from 'vue'

export function getPartyRolesColumn<T extends { roles: PartyRoleSchema, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const rolesColumn: TableBusinessColumn<T> = {
    id: 'roles',
    header: t('label.roles'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-40 max-w-40 overflow-clip'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      return h(
        TableColumnRoles,
        {
          roles: row.original.new.roles,
          isRemoved,
          class: cellClass
        },
        () => []
      )
    }
  }

  return rolesColumn
}
