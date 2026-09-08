import { getBusinessNameColumn } from './get-business-name-column'
import { getBusinessTypeColumn } from './get-business-type-column'
import { getAddressOrJurisdictionColumn } from './get-address-or-jurisdiction-column'

export function getAmalgamationTableColumns<T extends AmalgamationTableRow = AmalgamationTableRow>(
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): TableBusinessColumn<T>[] {
  const numberColumn = getBusinessNameColumn<T>('first', badgeLabelOverrides)
  const typeColumn = getBusinessTypeColumn<T>()
  const addressOrJurisdictionColumn = getAddressOrJurisdictionColumn<T>()
  const actionsColumn = getActionsColumn<T>()

  return [
    numberColumn,
    typeColumn,
    addressOrJurisdictionColumn,
    actionsColumn
  ]
}
