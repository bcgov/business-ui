import { isEqual } from 'es-toolkit'

export function formatLiquidatorsApi(
  tableState: TableBusinessState<PartySchema>[],
  formState: LiquidatorFormSchema,
  type: LiquidateType,
  commonData: FilingPayloadData,
  currentLiquidationOffice?: LiquidationRecordsOffice
): LiquidatorPayload {
  const payload: LiquidatorPayload = {
    type,
    ...commonData,
    changeOfLiquidatorsDate: getToday()
  }

  const changedRelationships = tableState.map(rel => formatRelationshipApi(rel.new)).filter(rel => rel.actions?.length)

  if (changedRelationships.length > 0) {
    payload.relationships = changedRelationships
  }

  const isIntent = type === LiquidateType.INTENT
  const hasOfficeChange = type === LiquidateType.ADDRESS && !isEqual(
    {
      mailingAddress: formState.recordsOffice.mailingAddress,
      deliveryAddress: formState.recordsOffice.deliveryAddress
    },
    currentLiquidationOffice
  )

  if (isIntent || hasOfficeChange) {
    payload.offices = {
      liquidationRecordsOffice: {
        mailingAddress: formatAddressApi(formState.recordsOffice.mailingAddress as ConnectAddress),
        deliveryAddress: formatAddressApi(formState.recordsOffice.deliveryAddress as ConnectAddress)
      }
    }
  }

  return payload
}
