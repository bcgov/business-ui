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

      const nameValue = row.original.new.name

      const name = h('span', nameValue)

      return h(
        TableColumnIdentity,
        {
          label: nameValue,
          badges,
          class: [defaultClass, isRemoved ? DELETED_CLASS : '']
        },
        () => name
      )
    }
  }

  return nameColumn
}
