import { TableColumnIdentity } from '#components'
import { h } from 'vue'

export function getPartyNameColumn<T extends { name: PartyNameSchema, actions: ActionType[] }>(
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
      const nameProps = row.original.new.name

      const label = nameProps.partyType === PartyType.PERSON
        ? `${nameProps.firstName} ${nameProps.middleName} ${nameProps.lastName}`.toUpperCase()
        : nameProps.businessName?.toUpperCase() || ''

      const preferredName = row.original.new.name.preferredName

      return h(
        TableColumnIdentity,
        {
          label,
          badges,
          class: cellClass
        },
        {
          'additional-label': () => preferredName
            ? h('div', { class: 'flex flex-col' }, [
              h('i', { class: 'text-sm italic font-normal' }, t('label.preferredName') + ':'),
              h('span', { class: 'text-sm' }, preferredName.toUpperCase())])
            : []
        }
      )
    }
  }

  return nameColumn
}
