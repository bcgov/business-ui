import { h } from 'vue'

export function getShareClassOrSeriesNameColumn<T extends ShareClassSchema>(
  metaOption: TableColumnMetaOption = 'first'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const maxColumn: TableBusinessColumn<T> = {
    id: 'maxNumberOfShares',
    header: t('label.maxNumberOfShares'),
    meta,
    cell: ({ row }) => {
      // row.depth === 0 is a top level row (Class)
      // row.depth === 1 is a sub row (Series)
      const isSeries = row.depth === 1

      const noMaxText = t('label.noMaximum')

      // const maxShares = isSeries
      // ? row.original

      return h(
        'span',
        {
          class: isSeries
            ? [ // apply list styling to series name
              'flex items-center gap-2 ml-4',
              'before:size-1 before:bg-black before:rounded-full'
            ]
            : 'font-bold'
        },
        row.original.new.name
      )
    }
  }

  return maxColumn
}
