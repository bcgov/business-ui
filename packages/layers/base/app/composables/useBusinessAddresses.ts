export const useBusinessAddresses = () => {
  const service = useBusinessService()

  async function getBusinessAddresses(
    businessId: string
  ): Promise<UiEntityOfficeAddress> {
    const res = await service.getAddresses(businessId)

    return {
      ...(res.registeredOffice && { registeredOffice: formatBaseAddressUi(res.registeredOffice) }),
      ...(res.recordsOffice && { recordsOffice: formatBaseAddressUi(res.recordsOffice) }),
      ...(res.businessOffice && { businessOffice: formatBaseAddressUi(res.businessOffice) }),
      ...(
        res.liquidationRecordsOffice
        && { liquidationRecordsOffice: formatBaseAddressUi(res.liquidationRecordsOffice) }
      )
    }
  }

  return {
    getBusinessAddresses
  }
}
