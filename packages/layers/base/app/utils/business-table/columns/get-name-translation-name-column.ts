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

      const name = h(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center' } },
        [
          h('span', { style: { marginRight: '30px', fontWeight: 'bold' } }, t('label.translationName')),
          row.original.new.name || t('label.noName')
        ]
      )

      const displayText = name || t('label.noName')

      return h(
        TableColumnIdentity,
        {
          label: row.original.new.name,
          badges,
          class: cellClass
        },
        displayText
      )
    }
  }

  return nameColumn
}
