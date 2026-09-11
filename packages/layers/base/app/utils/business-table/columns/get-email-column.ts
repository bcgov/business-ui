import { h } from 'vue'
import { DELETED_CLASS } from './constants'

export function getEmailColumn<T extends { email: string, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const emailColumn: TableBusinessColumn<T> = {
    id: 'email',
    header: t('label.email'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48 overflow-clip break-words'
      const email = row.original.new.email || t('label.notAvailable')

      return h(
        'span',
        {
          class: [defaultClass, isRemoved ? DELETED_CLASS : '']
        },
        email
      )
    }
  }

  return emailColumn
}
