// IMPORTANT: This service is meant as an abstraction layer to interact with the cache and queries directly
// IMPORTANT: do not define raw GET requests in this file - define the request in the query file
// and abstract here if necessary
import { getCachedOrFetch } from '../helpers'

/**
 * BUSINESS SERVICE
 *
 * This service acts as an abstraction over the useBusinessQuery queries.
 * * USE THIS SERVICE ONLY IF:
 * - You are inside a pinia store and need to "await" data.
 * - You are in a route guard/middleware and need to validate data before entry.
 * - You need to await multiple API calls sequentially (promise.all/setup logic).
 * * DO NOT USE THIS SERVICE IF:
 * - You are inside a Vue Component.
 * - You need to display "isLoading" or "error" states in the UI.
 * - You want automatic background refetching and observer management.
 * * COMPONENT USAGE:
 * Always prefer 'useBusinessQuery()' directly in components.
*/

// Example:

// Incorrect Component setup
//
// const service = useBusinessService()
// const loading = ref(true)
// const business = ref()
// We have to manually manage everything
// onMounted(async () => {
//   try {
//    business.value = await service.getBusiness('123')
//   } catch (e) {
//     ...handle error
//   } finally {
//     loading.value = false
//   }
// })

// Correct Component setup
// const query = useBusinessQuery()
// One line handles loading, data, reactivity, and caching
// const { data: business, isLoading } = query.business('123')

export const useBusinessService = () => {
  const query = useBusinessQuery()
  const { $businessApi } = useNuxtApp()

  /**
   * Fetches business addresses by its business identifier.
   * @param businessId the identifier of the business
   * @returns a promise to return the addresses for this business
   */
  async function getAddresses(businessId: string, force = false) {
    const options = query.addressesOptions(businessId)
    return await getCachedOrFetch<ApiEntityOfficeAddress>(options, force)
  }

  /**
   * Fetches business aliases used as name translations.
   * @param businessId the business identifier
   * @returns a promise to return aliases as name translations
   */
  async function getNameTranslations(businessId: string, force = false): Promise<NameTranslation[]> {
    const options = query.aliasesOptions(businessId)
    return await getCachedOrFetch(options, force).then(res =>
      res.aliases
        .filter(alias => alias.type === 'TRANSLATION')
        .map(({ id, name }) => ({ id, name }))
    )
  }

  /**
   * Fetches a filing by ID and validates that it is a usable draft of the expected type.
   *
   * @param businessId The identifier for the business.
   * @param draftId The ID of the draft filing to load.
   * @param filingName The name of the filing to validate for.
   * @returns A promise that resolves the draft filing response and if the filing is of the expected type.
  */
  async function getAndValidateDraftFiling<F extends FilingRecord>(
    businessId: string,
    draftId: number | string,
    filingName: FilingType,
    force = false
  ): Promise<FilingGetByIdResponse<F>> {
    const options = query.filingOptions<F>(businessId, draftId)
    const result = await getCachedOrFetch(options, force)

    const isValid = isValidDraft<F>(filingName, result)
    if (!isValid) {
      throw new Error('invalid-draft-filing')
    }

    return result
  }

  /**
   * Fetches the auth info of the given business.
   * @returns a promise to return the data
   */
  async function getAuthInfo(businessId: string, force = false): Promise<AuthInformation> {
    const options = query.authInfoOptions(businessId)
    return await getCachedOrFetch(options, force)
  }

  /**
   * Fetches authorized actions (aka permissions) from the Legal API.
   * @returns a promise to return authorized actions list
   */
  async function getAuthorizedActions(businessId: string, force = false): Promise<AuthorizedAction[]> {
    const options = query.authorizedActionsOptions(businessId)
    return await getCachedOrFetch<{ authorizedPermissions: AuthorizedAction[] }>(options, force)
      .then(res => res.authorizedPermissions)
  }

  /**
   * Fetches the business info of the current business.
   * @param businessId the identifier of the business
   * @returns a promise to return business data
  */
  function getBusiness(
    businessId: string, slim: boolean, publicData: boolean, force?: boolean): Promise<BusinessData | BusinessDataPublic>
  function getBusiness(
    businessId: string, slim: true, publicData?: boolean, force?: boolean): Promise<BusinessDataPublic>
  function getBusiness(
    businessId: string, slim: boolean, publicData: true, force?: boolean): Promise<BusinessDataPublic>
  function getBusiness(businessId: string, slim?: false, publicData?: false, force?: boolean): Promise<BusinessData>
  async function getBusiness(
    businessId: string,
    slim = false,
    publicData = false,
    force = false
  ): Promise<BusinessDataPublic | BusinessData> {
    const options = query.businessOptions(businessId, slim, publicData)
    return await getCachedOrFetch<{ business: BusinessData | BusinessDataPublic }>(options, force)
      .then(res => res.business)
  }

  /**
   * Fetches a bootstrap filing by its temporary business identifier.
   * @param tempRegId the temporary identifier of the business
   * @returns a promise to return the filing information for this temporary business
   */
  async function getBootstrapFiling(
    tempRegId: string,
    force = false
  ): Promise<FilingGetByIdResponse<BootstrapFiling> | undefined> {
    if (!isTempRegIdentifier(tempRegId)) {
      console.error('Attempting to get bootstrap filing with invalid temp reg id:', tempRegId)
      return
    }
    const options = query.bootstrapFilingOptions(tempRegId)
    return await getCachedOrFetch(options, force)
  }

  /**
   * Fetches documents object.
   * @param url the full URL to fetch the documents
   * @param options the options to fetch the documents
   * @returns the fetch documents object
   */
  async function getDocument(url: string, force = false): Promise<Blob> {
    const options = query.documentOptions(url)
    return await getCachedOrFetch(options, force)
  }

  /**
   * Fetches a filing by its id.
   * @param businessId the identifier of the business
   * @param filingId the id of the filing
   * @returns a promise to return the filing
   */
  async function getFiling<F extends FilingRecord>(
    businessId: string,
    filingId: number | string,
    force = false
  ): Promise<FilingGetByIdResponse<F>> {
    const options = query.filingOptions<F>(businessId, filingId)
    return await getCachedOrFetch(options, force)
  }

  /**
   * Fetches the list of documents grouped by types.
   * @param url the full URL to fetch the comments
   * @returns a promise to return the comments list for the url
   */
  async function getFilingComments(
    url: string,
    force = false
  ): Promise<BusinessComment[]> {
    const options = query.filingCommentsOptions(url)
    const result = await getCachedOrFetch(options, force)
    return result.comments.map(comment => comment.comment).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  /**
   * Fetches the parties of the current business.
   * @param businessId the identifier of the business
   * @param query the query to add to the request (e.g., { role: 'director' })
   * @returns a promise to return the data
   */
  async function getFilingDocumentUrls(
    businessId: string,
    filingId: string,
    force = false
  ): Promise<BusinessFilingDocumentUrls> {
    const options = query.filingDocumentUrlsOptions(businessId, filingId)
    return await getCachedOrFetch(options, force).then(res => res.documents)
  }

  /**
   * Fetches a business ledger by its business identifier.
   * @param businessId the identifier of the business
   * @returns a promise to return the ledger for this business
   */
  async function getLedger(
    businessId: string,
    effectiveDate?: IsoDatePacific,
    force = false
  ): Promise<BusinessLedgerItem[] | undefined> {
    if (isTempRegIdentifier(businessId)) {
      console.error('Attempting to get business ledger with a temp reg id:', businessId)
      return
    }
    const options = query.ledgerOptions(businessId, effectiveDate)
    return await getCachedOrFetch(options, force).then(res => res.filings)
  }

  /**
   * Fetches a business linked Name Request by its NR number.
   * @param nrNumber the Name Request number
   * @returns a promise to return the Name Request information for this temporary business
   */
  async function getLinkedNameRequest(nrNumber: string, force = false): Promise<NameRequest> {
    const options = query.linkedNameRequestOptions(nrNumber)
    return await getCachedOrFetch(options, force)
  }

  /**
   * Fetches business share classes.
   * @param businessId the business identifier (aka entity inc no)
   * @param classId the specific share class to fetch
   * @returns A promise that resolves the business share classes.
  */
  async function getShareClasses(businessId: string, classId?: undefined, force?: boolean): Promise<ShareClass[]>
  async function getShareClasses(businessId: string, classId: string | number, force?: boolean): Promise<ShareClass>
  async function getShareClasses(
    businessId: string, classId?: string | number, force = false
  ): Promise<ShareClass | ShareClass[]> {
    const options = query.shareClassOptions(businessId, classId)
    return await getCachedOrFetch(options, force)
      .then(res => classId
        ? (res as { shareClass: ShareClass }).shareClass
        : (res as { shareClasses: ShareClass[] }).shareClasses
      )
  }

  /**
   * Fetches business tasks list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns A promise that resolves the business tasks.
  */
  async function getTasks(businessId: string, force = false): Promise<TaskItem[]> {
    const options = query.tasksOptions(businessId)
    return await getCachedOrFetch(options, force).then(res => res.tasks)
  }

  /**
   * Fetches the parties of the current business.
   * @param businessId the identifier of the business
   * @param partyQuery the query to add to the request (e.g., { role: 'director' })
   * @returns a promise to return the data
   */
  async function getParties(
    businessId: string,
    partyQuery?: Record<string, unknown>,
    force = false
  ): Promise<OrgPerson[]> {
    const options = query.partiesOptions(businessId, partyQuery)
    return await getCachedOrFetch(options, force).then(res => res.parties)
  }

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
  async function deleteFiling(businessId: string, filingId: number): Promise<unknown> {
    return $businessApi(`businesses/${businessId}/filings/${filingId}`, { method: 'DELETE' })
  }

  return {
    // GETs
    getAddresses,
    getNameTranslations,
    getAndValidateDraftFiling,
    getAuthInfo,
    getAuthorizedActions,
    getBusiness,
    getBootstrapFiling,
    getDocument,
    getFiling,
    getFilingComments,
    getFilingDocumentUrls,
    getLedger,
    getLinkedNameRequest,
    getShareClasses,
    getTasks,
    getParties,
    // ...rest
    postFiling,
    saveOrUpdateDraftFiling,
    deleteFiling
  }
}
