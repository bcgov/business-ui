import { TableColumnIdentity } from '#components'
import { h } from 'vue'
import { DELETED_CLASS } from './constants'

export function getShareClassOrSeriesNameColumn<T extends ShareClassSchema>(
  metaOption: TableColumnMetaOption = 'first',
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
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
      const defaultClass = 'font-bold min-w-40 max-w-40'

      // if the parent row is removed, show no badges on the series
      const badges = isParentRowRemoved ? [] : getTableBadges(row, badgeLabelOverrides)

      const label = row.original.new.name + ' ' + t('label.shares')

      return h(
        TableColumnIdentity,
        {
          badges,
          label,
          class: [
            isSeries ? 'ml-6' : '',
            defaultClass
          ],
          labelClass: (isSeries // apply list styling to series name
            ? 'flex flex-row items-center -ml-3 gap-2 before:size-1 before:bg-black before:rounded-full '
            : '') + ((isRowRemoved || isParentRowRemoved) ? DELETED_CLASS : '')
        }
      )
    }
  }

  return nameColumn
}
