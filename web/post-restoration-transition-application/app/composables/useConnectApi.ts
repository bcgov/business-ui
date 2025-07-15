export const useConnectApi = () => {
  const { $connectApi } = useNuxtApp()

  /**
   * Retrieves share-classes for the business id
   *
   * @param {string} businessId - The unique identifier of the business whose addresses are being requested.
   * @return {Promise<Shares>} A promise that resolves to the response containing the share-classes.
   */
  async function getShareClasses(businessId: string): Promise<Share> {
    return await $connectApi<Share>(`businesses/${businessId}/share-classes`)
  }

  return {
    getShareClasses
  }
}
