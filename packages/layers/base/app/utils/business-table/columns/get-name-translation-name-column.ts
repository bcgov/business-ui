import { TableColumnIdentity } from '#components'
import { h } from 'vue'

export function getNameTranslationNameColumn<T extends NameTranslationSchema>(
  metaOption: TableColumnMetaOption = 'first',
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const nameColumn: TableBusinessColumn<T> = {
    id: 'translation-name',
    meta,
    cell: ({ row }) => {
      const badges = getTableBadges(row, badgeLabelOverrides)
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'w-full overflow-clip' // Set the width to 100% of the outer layer
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      const nameValue = row.original.new.name || t('label.noNameTranslations')

      const name = h(
        'span',
        { class: 'inline-flex items-center gap-8' },
        [
          h('span', { class: 'font-bold' }, t('label.translationName')),
          nameValue
        ]
      )

      return h(
        TableColumnIdentity,
        {
          label: nameValue,
          badges,
          class: cellClass
        },
        name
      )
    }
  }

  return nameColumn
}
