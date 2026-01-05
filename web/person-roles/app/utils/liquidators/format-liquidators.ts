// TODO: include office address on changeAddressLiquidator only if it's different from the existing data
export function formatLiquidatorsApi(
  tableState: TableBusinessState<PartySchema>[],
  formState: LiquidatorFormSchema,
  type: LiquidateType,
  commonData: FilingPayloadData
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

  if (type === LiquidateType.INTENT) {
    payload.offices = {
      liquidationRecordsOffice: {
        mailingAddress: formatAddressApi(formState.recordsOffice.mailingAddress as ConnectAddress),
        deliveryAddress: formatAddressApi(formState.recordsOffice.deliveryAddress as ConnectAddress)
      }
    }
  }

  return payload
}
