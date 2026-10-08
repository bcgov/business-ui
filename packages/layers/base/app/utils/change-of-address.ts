// NB: direct imports needed so that this util can be used in e2e tests
import { formatOfficeApi } from '#business/app/utils/format-address'

/**
 * Builds the changeOfAddress `offices` payload from the ManageOffices table state.
 */
export function buildChangeOfAddressOffices(
  tableState: TableBusinessState<OfficesSchema>[]
): Partial<Record<OfficeType, { mailingAddress: ApiAddress, deliveryAddress: ApiAddress }>> {
  const offices: Partial<Record<OfficeType, { mailingAddress: ApiAddress, deliveryAddress: ApiAddress }>> = {}
  for (const row of tableState) {
    offices[row.new.type] = formatOfficeApi(row.new.address)
  }
  return offices
}
