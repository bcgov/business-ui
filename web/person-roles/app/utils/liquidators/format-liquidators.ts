import { isEqual } from 'es-toolkit'

export function formatLiquidatorsApi(
  tableState: TableBusinessState<PartySchema>[],
  formState: LiquidatorFormSchema,
  type: LiquidateType,
  commonData: FilingPayloadData,
  currentLiquidationOffice?: UiBaseAddressObj
): LiquidatorPayload {
  const changedRelationships = tableState.map(rel => formatRelationshipApi(rel.new)).filter(rel => rel.actions?.length)

  const isIntent = type === LiquidateType.INTENT
  const hasOfficeChange = type === LiquidateType.ADDRESS && !isEqual(
    {
      mailingAddress: formState.recordsOffice.mailingAddress,
      deliveryAddress: formState.recordsOffice.deliveryAddress
    },
    {
      mailingAddress: currentLiquidationOffice?.mailingAddress,
      deliveryAddress: currentLiquidationOffice?.deliveryAddress
    }
  )

  return {
    type,
    ...commonData,
    changeOfLiquidatorsDate: getToday(),
    ...(changedRelationships.length > 0 && { relationships: changedRelationships }),
    ...((isIntent || hasOfficeChange) && {
      offices: {
        liquidationRecordsOffice: formatOfficeApi(formState.recordsOffice)
      }
    })
  }
}
