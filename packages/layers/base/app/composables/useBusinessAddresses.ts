import { isEqual } from 'es-toolkit'

export const useBusinessAddresses = () => {
  const businessApi = useBusinessApi()

  async function getBusinessAddresses(
    businessId: string
  ): Promise<{
    error: Error | undefined | null
    data: UiEntityOfficeAddress | undefined
  }> {
    const resp = await businessApi.getBusinessAddresses(businessId)
    return resp.refresh().then((state) => {
      const format = (office: ApiBaseAddressObj) => {
        if (!office) {
          return undefined
        }
        const mailingAddress = formatAddressUi(office.mailingAddress)
        const deliveryAddress = formatAddressUi(office.deliveryAddress)
        return {
          mailingAddress,
          deliveryAddress,
          sameAs: isEqual(mailingAddress, deliveryAddress)
        }
      }

      const data = state.data
      if (!data) {
        return { error: state.error, data: undefined }
      }

      return {
        error: state.error,
        data: {
          ...(data.registeredOffice && { registeredOffice: format(data.registeredOffice) }),
          ...(data.recordsOffice && { recordsOffice: format(data.recordsOffice) }),
          ...(data.businessOffice && { businessOffice: format(data.businessOffice) }),
          ...(data.liquidationRecordsOffice && { liquidationRecordsOffice: format(data.liquidationRecordsOffice) })
        }
      }
    })
  }

  return {
    getBusinessAddresses
  }
}
