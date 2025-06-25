export const useLegalApi = () => {
  const { $legalApi } = useNuxtApp()
  const { kcUser } = useKeycloak()
  const accountId = useConnectAccountStore().currentAccount.id

  /**
   * Fetches a filing by its id.
   * @param businessId the identifier of the business
   * @param filingId the id of the filing
   * @returns a promise to return the filing
   */
  async function getFilingById(businessId: string, filingId: number): Promise<unknown> {
    return $legalApi(`businesses/${businessId}/filings/${filingId}`)
  }

  // TODO: update return type
  /**
   * Submits a new filing to the Legal API.
   * This function is generic and will return a typed response
   * based on the filing name and payload provided.
   * @param business The business object.
   * @param filingName The name of the filing.
   * @param payload The data payload for the specific filing type.
   * @returns A promise that resolves to the full API response, including the filing payload.
  */
  async function postFiling<T extends string, P>(
    business: BusinessData | BusinessDataSlim,
    filingName: T,
    payload: P
  ): Promise<FilingPostResponse & { filing: { [K in T]: P } }> {
    const filingBody = {
      filing: {
        header: {
          name: filingName,
          certifiedBy: kcUser.value.fullName,
          accountId: accountId,
          date: getToday()
        },
        business: {
          identifier: business.identifier,
          foundingDate: business.foundingDate,
          legalName: business.legalName,
          legalType: business.legalType
        },
        [filingName]: payload
      }
    }

    return $legalApi(`businesses/${business.identifier}/filings`,
      {
        method: 'POST',
        body: filingBody
      }
    )
  }

  /**
   * Delete a business filing by id
   * @param businessId the identifier of the business
   * @param filingId the id of the filing
   * @returns a promise to delete the filing
   */
  async function deleteFilingById(businessId: string, filingId: number): Promise<unknown> {
    return $legalApi(`businesses/${businessId}/filings/${filingId}`, { method: 'DELETE' })
  }

  /**
   * Fetches the business info of the current business.
   * @param businessId the identifier of the business
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
   * @param businessId the identifier of the business
   * @param query the query to add to the request (e.g., { role: 'director' })
   * @returns a promise to return the data
   */
  async function getParties(businessId: string, query?: Record<string, unknown>): Promise<OrgPerson[]> {
    const response = await $legalApi<{ parties: OrgPerson[] }>(`businesses/${businessId}/parties`, {
      query
    })

    return response.parties
  }

  return {
    getFilingById,
    deleteFilingById,
    postFiling,
    getBusiness,
    getParties
  }
}
