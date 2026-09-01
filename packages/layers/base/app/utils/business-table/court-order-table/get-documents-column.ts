import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'
import { TableColumnDocuments } from '#components'

export function getDocumentsColumn<T extends CourtOrderPoaFullSchema>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const column: TableBusinessColumn<T> = {
    id: 'court-order-documents',
    header: t('label.documents'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48'

      return h(
        TableColumnDocuments,
        {
          class: [defaultClass, isRemoved ? DELETED_CLASS : ''],
          files: row.original.new.files,
          isRemoved
        }
      )
    }
  }

  return column
}
