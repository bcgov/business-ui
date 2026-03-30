export const useBusinessApi = () => {
  const { $businessApi } = useNuxtApp()

  /**
   * Submits a new filing to the Legal API.
   * This function is generic and will return a typed response
   * @param identifier The business identifier object.
   * @param body The data payload for the filing creation.
   * @returns A promise that resolves to the full API response, including the filing payload.
  */
  async function postFiling<F extends FilingRecord>(
    identifier: string,
    body: FilingSubmissionBody<F>,
    headers?: HeadersInit
  ): Promise<FilingPostResponse<F>> {
    return $businessApi(`businesses/${identifier}/filings`,
      {
        method: 'POST',
        body,
        headers: headers ? headers : {}
      }
    )
  }

  /**
    * Creates a new filing (POST) or updates an existing one (PUT).
    * This function handles both draft saves and final submissions based on the `isSubmission` flag.
    *
    * @param identifier The business identifier object.
    * @param body The data payload for the filing creation.
    * @param isSubmission - If false, the filing is saved as draft. If true, it is submitted as final.
    * @param filingId - The filing Id to submit the PUT request against. Will submit a POST request if undefined.
    *
    * @returns A promise that resolves the API response.
  */
  // will return Promise<FilingPutResponse<F> if filingId is provided
  async function saveOrUpdateDraftFiling<F extends FilingRecord>(
    identifier: string,
    body: FilingSubmissionBody<F>,
    isSubmission: boolean,
    filingId: string | number,
    headers?: HeadersInit
  ): Promise<FilingPutResponse<F>>
  // will return Promise<FilingPostResponse<F> if no filingId is provided
  async function saveOrUpdateDraftFiling<F extends FilingRecord>(
    identifier: string,
    body: FilingSubmissionBody<F>,
    isSubmission: boolean
  ): Promise<FilingPostResponse<F>>
  // main function
  async function saveOrUpdateDraftFiling<F extends FilingRecord>(
    identifier: string,
    body: FilingSubmissionBody<F>,
    isSubmission = false,
    filingId?: string | number,
    headers?: HeadersInit
  ): Promise<FilingPutResponse<F> | FilingPostResponse<F>> {
    const url = filingId
      ? `businesses/${identifier}/filings/${filingId}`
      : `businesses/${identifier}/filings`
    const method = filingId ? 'PUT' : 'POST'
    const query = isSubmission ? undefined : { draft: true }
    headers = headers ? headers : {}

    return $businessApi(url,
      {
        method,
        body,
        query,
        headers
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
    return $businessApi(`businesses/${businessId}/filings/${filingId}`, { method: 'DELETE' })
  }

  return {
    deleteFilingById,
    postFiling,
    saveOrUpdateDraftFiling
  }
}
