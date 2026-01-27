export const useBusinessAddresses = () => {
  const service = useBusinessService()

  async function getBusinessAddresses(businessId: string, config?: 'default'): Promise<UiEntityOfficeAddress>
  async function getBusinessAddresses(businessId: string, config: 'table'): Promise<TableBusinessState<OfficesSchema>[]>
  async function getBusinessAddresses(businessId: string, config: 'default' | 'table' = 'default'): Promise<
    UiEntityOfficeAddress | TableBusinessState<OfficesSchema>[]
  > {
    const res = await service.getAddresses(businessId)

    // return UiEntityOfficeAddress object if default config option provided
    if (config === 'default') {
      return {
        ...(res.registeredOffice && { registeredOffice: formatBaseAddressUi(res.registeredOffice) }),
        ...(res.recordsOffice && { recordsOffice: formatBaseAddressUi(res.recordsOffice) }),
        ...(res.businessOffice && { businessOffice: formatBaseAddressUi(res.businessOffice) }),
        ...(
          res.liquidationRecordsOffice
          && { liquidationRecordsOffice: formatBaseAddressUi(res.liquidationRecordsOffice) }
        ),
        ...(res.custodialOffice && { custodialOffice: formatBaseAddressUi(res.custodialOffice) }
        )
      }
    }

    // return TableBusinessState<OfficesSchema> array if table config option provided
    // used for ManageOffices functionality
    return Object.entries(res).map(([key, value]) => ({
      new: {
        type: key as OfficeType,
        actions: [],
        address: formatBaseAddressUi(value)
      },
      old: {
        type: key as OfficeType,
        actions: [],
        address: formatBaseAddressUi(value)
      }
    }))
  }

  return {
    getBusinessAddresses
  }
}
