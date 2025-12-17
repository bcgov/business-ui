import { TableColumnDeliveryAddress } from '#components'
import { h } from 'vue'

export function getDeliveryAddressColumn<T extends { address: AddressSchema, actions: ActionType[] }>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const deliveryColumn: TableBusinessColumn<T> = {
    id: 'deliveryAddress',
    header: t('label.deliveryAddress'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48 overflow-clip'
      const cellClass = isRemoved ? defaultClass + ' opacity-50' : defaultClass

      return h(
        TableColumnDeliveryAddress,
        {
          data: row.original.new.address,
          class: cellClass
        },
        () => []
      )
    }
  }

  return deliveryColumn
}
