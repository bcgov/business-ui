import { isEqual } from 'es-toolkit'

export const useBusinessAddresses = () => {
  const service = useBusinessService()
  const allOfficeTypes = Object.values(OfficeType)

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

    const filteredTypes = allOfficeTypes.filter(type =>
      res[type as keyof ApiEntityOfficeAddress] && (!officeTypes || officeTypes.includes(type))
    )

    // return UiEntityOfficeAddress object if default config option provided
    if (config === 'default') {
      const offices: UiEntityOfficeAddress = {}
      for (const type of filteredTypes) {
        offices[type] = formatBaseAddressUi(res[type])
      }
      return offices
    }

    // return TableBusinessState<OfficesSchema> array if table config option provided
    // used for ManageOffices functionality
    return formatAddressTableState(res, filteredTypes)
  }

  function formatAddressTableState(
    addresses: ApiEntityOfficeAddress,
    officeTypes?: OfficeType[]
  ): TableBusinessState<OfficesSchema>[] {
    const types = officeTypes ?? allOfficeTypes
    return types.map((type) => {
      const formatted = {
        type,
        actions: [],
        address: formatBaseAddressUi(addresses[type])
      }

      return {
        new: { ...formatted },
        old: { ...formatted }
      }
    })
  }

  function formatDraftTableState(
    tableState: TableBusinessState<OfficesSchema>[],
    draftState: TableBusinessState<OfficesSchema>[]
  ): TableBusinessState<OfficesSchema>[] {
    return draftState.map((draft) => {
      const oldOffice = tableState.find(o => o.new.type === draft.new.type)
      const addressChanged = oldOffice && !isEqual(draft.new.address, oldOffice.new.address)

      let actions: ActionType[] = []
      if (addressChanged) {
        actions = [ActionType.ADDRESS_CHANGED]
      } else if (!oldOffice) {
        actions = [ActionType.ADDED]
      }

      return {
        new: {
          ...draft.new,
          actions
        },
        old: oldOffice ? { ...oldOffice.new } : undefined
      }
    })
  }

  return {
    getBusinessAddresses,
    formatAddressTableState,
    formatDraftTableState
  }
}
