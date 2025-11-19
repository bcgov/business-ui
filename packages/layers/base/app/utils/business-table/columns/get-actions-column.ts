import { h } from 'vue'

export function getActionsColumn<T>(
  metaOption: TableColumnMetaOption = 'last'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const actionsColumn: TableBusinessColumn<T> = {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, t('label.actions')),
    meta
  }

  return actionsColumn
}
