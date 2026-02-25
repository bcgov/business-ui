export function formatLiquidatorsApi(
  tableState: TableBusinessState<PartySchema>[],
  formState: LiquidatorFormSchema,
  type: LiquidateType,
  commonData: FilingPayloadData,
  tableOffices: TableBusinessState<OfficesSchema>[]
): LiquidatorPayload {
  const changedRelationships = tableState.map(rel => formatRelationshipApi(rel.new)).filter(rel => rel.actions?.length)
  const office = tableOffices.find(o => o.new.type === OfficeType.LIQUIDATION)?.new
  const isIntent = type === LiquidateType.INTENT
  const hasOfficeChange = type === LiquidateType.ADDRESS && office && office?.actions.length > 0
  const includeOffice = (isIntent || hasOfficeChange) && !!office

  return {
    type,
    ...commonData,
    changeOfLiquidatorsDate: getToday(),
    ...(changedRelationships.length > 0 && { relationships: changedRelationships }),
    ...(includeOffice && {
      offices: {
        liquidationRecordsOffice: formatOfficeApi(office.address)
      }
    })
  }
}
