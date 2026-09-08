import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'
import { isBCBusiness } from './utils'

export function getBusinessTypeColumn<T extends AmalgamationTableRow>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const typeColumn: TableBusinessColumn<T> = {
    id: 'business-type-column',
    header: t('label.businessType'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-40 max-w-40'

      const business = row.original.new

      return h(
        'span',
        {
          class: [defaultClass, isRemoved ? DELETED_CLASS : '']
        },
        isBCBusiness(business)
          ? business.legalType
          : t('label.foreign')
      )
    }
  }

  return typeColumn
}
