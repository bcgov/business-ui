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
      // row.depth === 0 is a top level row (Class)
      // row.depth === 1 is a sub row (Series)
      const isSeries = row.depth === 1

      // series row styling can change based on parent row removed action
      const isRowRemoved = getIsRowRemoved(row)
      const isParentRowRemoved = isSeries && getIsRowRemoved(row.getParentRow()!)

      const defaultClass = 'font-bold min-w-48 max-w-48' // flex flex-col gap-2
      // apply opacity whether the current or parent row is removed
      const cellClass = (isRowRemoved || isParentRowRemoved) ? defaultClass + ' opacity-50' : defaultClass

      // if the parent row is removed, show no badges on the series
      const badges = isParentRowRemoved ? [] : getTableBadges(row)

      const label = row.original.new.name + ' Shares'

      return h(
        TableColumnIdentity,
        {
          badges,
          label,
          class: [
            isSeries ? 'ml-6' : '',
            cellClass
          ],
          labelClass: isSeries // apply list styling to series name
            ? 'flex flex-row items-center -ml-3 gap-2 before:size-1 before:bg-black before:rounded-full'
            : ''
        }
      )
    }
  }

  return nameColumn
}
