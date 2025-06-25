import type { AddressesResponse } from '~/interfaces/addresses'

export const useLegalApi2 = () => {
  const { $legalApi } = useNuxtApp()

  /**
   * Retrieves a list of addresses associated with a given business ID.
   *
   * @param {string} businessId - The unique identifier of the business whose addresses are being requested.
   * @return {Promise<AddressesResponse>} A promise that resolves to the response containing the addresses.
   */
  async function getAddresses(businessId: string): Promise<AddressesResponse> {
    return await $legalApi<AddressesResponse>(`businesses/${businessId}/addresses`)
  }

  return {
    ...useLegalApi(),
    getAddresses
  }
}
