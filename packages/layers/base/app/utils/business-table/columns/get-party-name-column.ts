import { TableColumnIdentity } from '#components'
import { h } from 'vue'
import { CEASED_CLASS, DELETED_CLASS } from './constants'

export function getPartyNameColumn<T extends { name: PartyNameSchema, roles: PartyRoleSchema, actions: ActionType[] }>(
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
      // flag parties whose roles have all ceased (a removed party already has its own badge)
      const isCeased = getIsRowCeased(row)
      if (isCeased) {
        badges.unshift({ label: t('badge.ceased'), class: 'bg-shade-secondary text-neutral-highlighted' })
      }
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-36 max-w-36 font-bold flex flex-col gap-2 break-words'
      const nameProps = row.original.new.name

      const label = nameProps.partyType === PartyType.PERSON
        ? [nameProps.firstName, nameProps.middleName, nameProps.lastName].filter(Boolean).join(' ')
        : nameProps.businessName || ''

      const preferredName = row.original.new.name.preferredName

      return h(
        TableColumnIdentity,
        {
          label,
          badges,
          icon: nameProps.partyType === PartyType.PERSON ? 'i-mdi-account' : 'i-mdi-domain',
          iconClass: isCeased ? CEASED_CLASS : undefined,
          class: defaultClass,
          // ceased parties are shown in grey
          labelClass: isRemoved ? DELETED_CLASS : isCeased ? CEASED_CLASS : ''
        },
        {
          'additional-label': () => preferredName
            ? h('div', { class: 'flex flex-col pl-7' }, [
              h('i', { class: 'text-sm italic' }, t('label.preferredName') + ':'),
              h('span', { class: 'text-sm font-normal' }, preferredName)])
            : []
        }
      )
    }
  }

  return nameColumn
}
