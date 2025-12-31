export function formatLiquidatorsApi(
  tableState: TableBusinessState<PartySchema>[],
  formState: LiquidatorFormSchema,
  type: LiquidateType,
  commonData: FilingPayloadData
): LiquidatorPayload {
  return {
    type,
    relationships: (
      tableState.map(relationship => formatRelationshipApi(relationship.new))
    // Only add relationships that have changes
    ).filter(relationship => relationship.actions?.length),
    ...commonData,
    changeOfLiquidatorsDate: getToday(),
    offices: {
      liquidationRecordsOffice: {
        mailingAddress: formatAddressApi(formState.recordsOffice.mailingAddress as ConnectAddress),
        deliveryAddress: formatAddressApi(formState.recordsOffice.deliveryAddress as ConnectAddress)
      }
    }
  }
}
