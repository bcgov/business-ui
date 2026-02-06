import { TableColumnIdentity } from '#components'
import { h } from 'vue'

export function getShareClassOrSeriesNameColumn<T extends ShareClassSchema>(
  metaOption: TableColumnMetaOption = 'first'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const nameColumn: TableBusinessColumn<T> = {
    id: 'shareClassOrSeriesName',
    header: t('label.shareClassOrSeriesName'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'font-bold min-w-48 max-w-48' // flex flex-col gap-2
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      // row.depth === 0 is a top level row (Class)
      // row.depth === 1 is a sub row (Series)
      const isSeries = row.depth === 1
      const label = row.original.new.name
      const badges = getTableBadges(row)

      return h(
        TableColumnIdentity,
        {
          badges,
          label,
          class: [
            isSeries
              ? [ // apply list styling to series name
                'flex items-center gap-2 ml-4',
                'before:size-1 before:bg-black before:rounded-full'
              ]
              : '',
            cellClass
          ]
        }
      )
    }
  }

  return nameColumn
}
