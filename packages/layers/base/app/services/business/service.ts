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
//     handle error
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
  const nuxtApp = useNuxtApp()

  /**
   * Fetches business addresses by its business identifier.
   * @param businessId the identifier of the business
   * @returns a promise to return the addresses for this business
   */
  async function getAddresses(businessId: string, force = false) {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.addresses(businessId))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
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
  ) {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.filing<F>(businessId, draftId))
    const method = force ? refetch : refresh
    await method(true)

    const isValid = isValidDraft<F>(filingName, data.value)
    if (!isValid) {
      throw new Error('invalid-draft-filing')
    }

    return data.value!
  }

  /**
   * Fetches the auth info of the given business.
   * @returns a promise to return the data
   */
  async function getAuthInfo(businessId: string, force = false) {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.authInfo(businessId))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  /**
   * Fetches authorized actions (aka permissions) from the Legal API.
   * @returns a promise to return authorized actions list
   */
  async function getAuthorizedActions(businessId: string, force = false): Promise<AuthorizedAction[]> {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.authorizedActions(businessId))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!.authorizedPermissions
  }

  /**
   * Fetches the business info of the current business.
   * @param businessId the identifier of the business
   * @returns a promise to return business data
  */
  function getBusiness(businessId: string, slim: true, force?: boolean): Promise<BusinessDataSlim>
  function getBusiness(businessId: string, slim?: false, force?: boolean): Promise<BusinessData>
  async function getBusiness(
    businessId: string,
    slim = false,
    force = false
  ): Promise<BusinessDataSlim | BusinessData> {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.business(businessId, slim))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!.business
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
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.bootstrapFiling(tempRegId))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  /**
   * Fetches documents object.
   * @param url the full URL to fetch the documents
   * @param options the options to fetch the documents
   * @returns the fetch documents object
   */
  async function getDocument(businessId: string, url: string, filename: string, force = false): Promise<Blob> {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.document(businessId, url, filename))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
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
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.filing<F>(businessId, filingId))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  /**
   * Fetches the list of documents grouped by types.
   * @param url the full URL to fetch the comments
   * @returns a promise to return the comments list for the url
   */
  async function getFilingComments(
    businessId: string,
    filingId: string,
    url: string,
    force = false
  ): Promise<BusinessComment[]> {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(
      () => query.filingComments(businessId, filingId, url)
    )
    const method = force ? refetch : refresh
    await method(true)
    return data.value!.comments.map(comment => comment.comment).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
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
    const { data, refresh, refetch } = await nuxtApp.runWithContext(
      () => query.filingDocumentUrls(businessId, filingId)
    )
    const method = force ? refetch : refresh
    await method(true)
    return data.value!.documents
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
  ) {
    if (isTempRegIdentifier(businessId)) {
      console.error('Attempting to get business ledger with a temp reg id:', businessId)
      return
    }
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.ledger(businessId, effectiveDate))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  /**
   * Fetches a business linked Name Request by its NR number.
   * @param nrNumber the Name Request number
   * @returns a promise to return the Name Request information for this temporary business
   */
  async function getLinkedNameRequest(businessId: string, nrNumber: string, force = false): Promise<NameRequest> {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.linkedNameRequest(businessId, nrNumber))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  /**
   * Fetches business tasks list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns A promise that resolves the business tasks.
  */
  async function getTasks(businessId: string, force = false): Promise<TaskGetResponse> {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.tasks(businessId))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  /**
   * Fetches the parties of the current business.
   * @param businessId the identifier of the business
   * @param partyQuery the query to add to the request (e.g., { role: 'director' })
   * @returns a promise to return the data
   */
  async function getParties(businessId: string, partyQuery?: Record<string, unknown>, force = false) {
    const { data, refresh, refetch } = await nuxtApp.runWithContext(() => query.parties(businessId, partyQuery))
    const method = force ? refetch : refresh
    await method(true)
    return data.value!
  }

  return {
    getAddresses,
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
    getTasks,
    getParties
  }
}
