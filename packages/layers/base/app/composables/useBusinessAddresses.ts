export const useBusinessAddresses = () => {
  const service = useBusinessService()

  async function getBusinessAddresses(
    businessId: string,
    config?: 'default',
    officeTypes?: OfficeType[]
  ): Promise<UiEntityOfficeAddress>
  async function getBusinessAddresses(
    businessId: string,
    config: 'table',
    officeTypes?: OfficeType[]
  ): Promise<TableBusinessState<OfficesSchema>[]>
  async function getBusinessAddresses(
    businessId: string,
    config: 'default' | 'table' = 'default',
    officeTypes?: OfficeType[]
  ): Promise<UiEntityOfficeAddress | TableBusinessState<OfficesSchema>[]> {
    const res = await service.getAddresses(businessId)

    const allTypes = Object.values(OfficeType) as Exclude<OfficeType, OfficeType.UNKNOWN>[]
    const filteredTypes = allTypes.filter(type =>
      res[type as keyof ApiEntityOfficeAddress] && (!officeTypes || officeTypes.includes(type))
    )

    // return UiEntityOfficeAddress object if default config option provided
    if (config === 'default') {
      const offices: UiEntityOfficeAddress = {}
      for (const type of filteredTypes) {
        offices[type] = formatBaseAddressUi(res[type])
      }
      return offices as UiEntityOfficeAddress
    }

    // return TableBusinessState<OfficesSchema> array if table config option provided
    // used for ManageOffices functionality
    return filteredTypes.map((type) => {
      const formatted = {
        type,
        actions: [],
        address: formatBaseAddressUi(res[type])
      }
      return { new: { ...formatted }, old: { ...formatted }
      }
    })
  }

  return {
    getBusinessAddresses
  }
}
