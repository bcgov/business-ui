import { TableColumnMailingAddress } from '#components'
import { h } from 'vue'

export function getMailingAddressColumn<T extends { address: AddressSchema, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const mailingColumn: TableBusinessColumn<T> = {
    id: 'mailingAddress',
    header: t('label.mailingAddress'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48 overflow-clip'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      return h(
        TableColumnMailingAddress,
        {
          data: row.original.new.address,
          class: cellClass
        },
        () => []
      )
    }
  }

  return mailingColumn
}
