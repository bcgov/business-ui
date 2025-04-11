export const useLegalApi = () => {
  const { $legalApi } = useNuxtApp()

  /**
   * Fetches a filing by its id.
   * @param businessId the id of the business
   * @param filingId the id of the filing
   * @returns a promise to return the filing
   */
  async function getFilingById(businessId: string, filingId: number): Promise<unknown> {
    return $legalApi(`businesses/${businessId}/filings/${filingId}`)
  }

  /**
   * Deletes a filing by its id.
   * @param businessId the id of the business
   * @param filingId the id of the filing
   * @returns a promise to delete the filing
   */
  async function deleteFilingById(businessId: string, filingId: number): Promise<unknown> {
    return $legalApi(`businesses/${businessId}/filings/${filingId}`, { method: 'DELETE' })
  }

  /**
   * Fetches the business info of the current business.
   * @param businessId the id of the business
   * @returns a promise to return business data
   */
  function getBusiness(businessId: string, slim: true): Promise<BusinessDataSlim> // tell TS return type is slim if true
  function getBusiness(businessId: string, slim?: false): Promise<BusinessData>

  async function getBusiness(businessId: string, slim: boolean = false): Promise<BusinessData | BusinessDataSlim> {
    const response = await $legalApi<{ business: BusinessData | BusinessDataSlim }>(`businesses/${businessId}`, {
      query: slim ? { slim: true } : undefined
    })

    return response.business
  }

  /**
   * Fetches the parties of the current business.
   * @param businessId the id of the business
   * @returns a promise to return the data
   */
  async function getParties(businessId: string): Promise<unknown> {
    return $legalApi(`businesses/${businessId}/parties?role=officer`)
  }

  return {
    getFilingById,
    deleteFilingById,
    getBusiness,
    getParties
  }
}
