import { h } from 'vue'
import { DELETED_CLASS } from '../columns/constants'
import { isBCBusiness } from './utils'
import { ConnectAddressDisplay } from '#components'

export function getAddressOrJurisdictionColumn<T extends AmalgamationTableRow>(
  metaOption: TableColumnMetaOption = 'default'
): TableBusinessColumn<T> {
  const t = useNuxtApp().$i18n.t
  const meta = getColumnMeta<T>(metaOption)

  const column: TableBusinessColumn<T> = {
    id: 'address-or-jurisdiction-column',
    header: t('label.mailingAddressOrJurisdiction'),
    meta,
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const defaultClass = 'min-w-48 max-w-48'

      const business = row.original.new

      if (isBCBusiness(business)) {
        const address = formatAddressUi(business.mailingAddress)

        return h(
          ConnectAddressDisplay,
          {
            address,
            textDecor: true,
            class: [defaultClass, isRemoved ? DELETED_CLASS : '']
          }
        )
      }

      const { region, country } = business.jurisdiction

      const countryDisplay = isoCountriesList.find(c => c.alpha_2 === country)?.name || country
      const regionDisplay = countrySubdivisions.ca.find(r => r.code === region)?.name || region

      const display = country === 'CA' ? `${regionDisplay}, Canada` : countryDisplay

      return h(
        'span',
        {
          class: [defaultClass, isRemoved ? DELETED_CLASS : '']
        },
        display
      )
    }
  }

  return column
}
