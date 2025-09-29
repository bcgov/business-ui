import type { ApiResolutions } from '~/interfaces/articles'

export const useLegalApi2 = () => {
  const { $businessApi: $legalApi } = useNuxtApp()

  /**
   * Retrieves a list of addresses associated with a given business ID.
   *
   * @param {string} businessId - The unique identifier of the business whose addresses are being requested.
   * @return {Promise<IncorporationAddress>} A promise that resolves to the response containing the addresses.
   */
  async function getAddresses(businessId: string): Promise<IncorporationAddress> {
    return await $legalApi<IncorporationAddress>(`businesses/${businessId}/addresses`)
  }

  /**
   * Retrieves a list of resolutions associated with a given business ID.
   *
   * @param {string} businessId - The unique identifier of the business whose resolutions are being requested.
   * @return {Promise<{ resolutions: ApiResolutions[] }>} A promise that resolves to the response containing
   *  the resolutions.
   */
  async function getResolutions(businessId: string): Promise<{ resolutions: ApiResolutions[] }> {
    return await $legalApi<{ resolutions: ApiResolutions[] }>(`businesses/${businessId}/resolutions`)
  }

  /**
   * Retrieves a list of share classes associated with a given business ID.
   *
   * @param {string} businessId - The unique identifier of the business whose share classes are being requested.
   * @return {Promise<ShareStructure>} A promise that resolves to the response containing the share classes.
   */
  async function getShareClasses(businessId: string): Promise<ShareStructure> {
    return await $legalApi<ShareStructure>(`businesses/${businessId}/share-classes`)
  }

  return {
    ...useBusinessApi(),
    getAddresses,
    getResolutions,
    getShareClasses
  }
}
