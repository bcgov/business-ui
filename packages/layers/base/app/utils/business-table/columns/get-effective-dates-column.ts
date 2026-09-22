import { h } from 'vue'
import { DateTime } from 'luxon'
import { DELETED_CLASS } from './constants'

function formatDate(date: string): string | undefined {
  const dt = DateTime.fromISO(date, { zone: 'America/Vancouver' })
  return dt.isValid ? dt.toFormat('DDD') : undefined
}

export function getEffectiveDatesColumn<T extends { roles: PartyRoleSchema, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const effectiveDatesColumn: TableBusinessColumn<T> = {
    id: 'effectiveDates',
    header: t('label.effectiveDates'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-40 max-w-40 overflow-clip'
      const cellClass = [defaultClass, isRemoved ? DELETED_CLASS : '']

      // FUTURE: handle multiple roles/dates?
      const role = row.original.new.roles.find(role => role.appointmentDate)
      const startDate = role?.appointmentDate ? formatDate(role.appointmentDate) : undefined

      if (!startDate) {
        return h('span', { class: cellClass }, t('label.notAvailable'))
      }

      const endDate = role?.cessationDate ? formatDate(role.cessationDate) : undefined

      // once ceased, show the effective date as a Start/End range; otherwise just the date
      if (endDate) {
        return h('div', { class: [...cellClass, 'flex flex-col'] }, [
          h('span', startDate),
          h('span', { class: 'text-neutral text-xs' }, t('label.to')),
          h('span', endDate)
        ])
      }

      return h('span', { class: cellClass }, t('text.dateToCurrent', { date: startDate }))
    }
  }

  return effectiveDatesColumn
}
