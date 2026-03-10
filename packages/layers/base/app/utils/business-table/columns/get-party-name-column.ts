import { TableColumnIdentity } from '#components'
import { h } from 'vue'

export function getPartyNameColumn<T extends { name: PartyNameSchema, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'first',
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const nameColumn: TableBusinessColumn<T> = {
    id: 'name',
    header: t('label.name'),
    meta,
    cell: ({ row }) => {
      const badges = getTableBadges(row, badgeLabelOverrides)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-36 max-w-36 font-bold flex flex-col gap-2 break-words'
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
