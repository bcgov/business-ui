import { h } from 'vue'
import { merge } from 'es-toolkit'

export function getActionsColumn<T>(
  metaOption: TableColumnMetaOption = 'last',
  metaOverrides: Partial<TableBusinessColumnMeta<T>> = {}
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const defaultMeta = getColumnMeta<T>(metaOption)!
  const meta = merge(defaultMeta, metaOverrides)

  const actionsColumn: TableBusinessColumn<T> = {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, t('label.actions')),
    meta
  }

  return actionsColumn
}
