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
    relationships: (
      tableState.map(relationship => formatRelationshipApi(relationship.new))
    // Only add relationships that have changes
    ).filter(relationship => relationship.actions?.length),
    ...commonData,
    changeOfLiquidatorsDate: getToday()
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
