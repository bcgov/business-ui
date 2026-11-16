export const useBusinessAddresses = () => {
  const service = useBusinessService()
  const allOfficeTypes = Object.values(OfficeType)

  /** The business offices as UI addresses, filtered to the given types (draft merging lives in useFiling.initFiling) */
  async function getBusinessAddresses(
    businessId: string,
    officeTypes?: OfficeType[],
    date?: string,
    force = false
  ): Promise<UiEntityOfficeAddress> {
    // addresses as of a specific date (YYYY-MM-DD), e.g. a coop annual report's AGM date
    const res = await service.getAddresses(businessId, date ? { date } : undefined, force)

    const offices: UiEntityOfficeAddress = {}
    for (const type of allOfficeTypes) {
      if (res[type as keyof ApiEntityOfficeAddress] && (!officeTypes || officeTypes.includes(type))) {
        offices[type] = formatBaseAddressUi(res[type])
      }
    }
    return offices
  }

  return {
    getBusinessAddresses
  }
}
