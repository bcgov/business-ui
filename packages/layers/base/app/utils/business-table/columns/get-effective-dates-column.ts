import { h } from 'vue'
import { DateTime } from 'luxon'

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
      const defaultClass = 'min-w-48 max-w-48 overflow-clip'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      // FUTURE: handle multiple roles/dates?
      const foundDate = row.original.new.roles[0]?.appointmentDate
      let displayDate: string | undefined
      if (foundDate) {
        const dt = DateTime.fromISO(foundDate, { zone: 'America/Vancouver' })
        if (dt.isValid) {
          displayDate = dt.toFormat('DDD')
        }
      }
      const displayText = displayDate
        ? t('text.dateToCurrent', { date: displayDate })
        : t('label.notAvailable')

      return h(
        'span',
        {
          class: cellClass
        },
        displayText
      )
    }
  }

  return effectiveDatesColumn
}
