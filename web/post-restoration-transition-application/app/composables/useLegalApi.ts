export const useLegalApi2 = () => {
  const { $legalApi } = useNuxtApp()

  /**
   * Retrieves a list of addresses associated with a given business ID.
   *
   * @param {string} businessId - The unique identifier of the business whose addresses are being requested.
   * @return {Promise<IncorporationAddress>} A promise that resolves to the response containing the addresses.
   */
  async function getAddresses(businessId: string): Promise<IncorporationAddress> {
    return await $legalApi<IncorporationAddress>(`businesses/${businessId}/addresses`)
  }

  return {
    ...useLegalApi(),
    getAddresses
  }
}
