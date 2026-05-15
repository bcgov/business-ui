import { TableColumnIdentity } from '#components'
import { h } from 'vue'
import { merge } from 'es-toolkit'
import { DELETED_CLASS } from './constants'

export function getNameTranslationNameColumn<T extends NameTranslationSchema>(
  metaOption: TableColumnMetaOption = 'first',
  badgeLabelOverrides?: Partial<Record<ActionType, string>>,
  metaOverrides: Partial<TableBusinessColumnMeta<T>> = {}
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const defaultMeta = getColumnMeta<T>(metaOption)!
  const meta = merge(defaultMeta, metaOverrides)

  const nameColumn: TableBusinessColumn<T> = {
    id: 'translation-name',
    meta,
    header: () => h('span', { class: 'sr-only' }, t('label.nameTranslation')),
    cell: ({ row }) => {
      const badges = getTableBadges(row, badgeLabelOverrides)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'w-full overflow-clip' // Set the width to 100% of the outer layer

      return h(
        TableColumnIdentity,
        {
          label: row.original.new.name,
          badges,
          class: defaultClass,
          labelClass: isRemoved ? DELETED_CLASS : ''
        }
      )
    }
  }

  return nameColumn
}
