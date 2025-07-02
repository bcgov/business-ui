export const useLegalApi = () => {
  const { $legalApi } = useNuxtApp()
  const { kcUser } = useKeycloak()
  const accountId = useConnectAccountStore().currentAccount.id

  // function createFilingPayload<T extends string, P>(
  //   business: BusinessData | BusinessDataSlim,
  //   filingName: T,
  //   payload: P
  // ): { filing: FilingPostResponse<T, P> } {
  //   return {
  //     filing: {
  //       header: {
  //         name: filingName,
  //         certifiedBy: kcUser.value.fullName,
  //         accountId: accountId,
  //         date: getToday()
  //       },
  //       business: {
  //         identifier: business.identifier,
  //         foundingDate: business.foundingDate,
  //         legalName: business.legalName,
  //         legalType: business.legalType
  //       },
  //       [filingName]: payload
  //     }
  //   }
  // }

  /**
   * Fetches business tasks list.
   * @param businessId the business identifier (aka entity inc no)
   * @returns A promise that resolves the business tasks.
  */
  async function getTasks(businessId: string): Promise<TaskGetResponse> {
    return $legalApi(`businesses/${businessId}/tasks`)
  }

  /**
   * Checks if the specified business has a specific pending task.
   * @param businessId the business identifier (aka entity inc no)
   * @param task the task to try and return (filing or todo)
   * @returns The first found TaskItem if it exists or undefined
  */
  async function getPendingTask(businessId: string, task: 'filing'): Promise<FilingTask | undefined> // return FilingTask if task arg === 'filing'
  async function getPendingTask(businessId: string, task: 'todo'): Promise<TodoTask | undefined> // return TodoTask if task arg === 'todo'
  async function getPendingTask(
    businessId: string,
    task: 'filing' | 'todo'
  ): Promise<FilingTask | TodoTask | undefined> {
    const res = await getTasks(businessId)
    // return the pending filing if it exists
    if (task === 'filing') {
      const taskItem = res.tasks.find((task) => {
        if ('filing' in task.task) {
          return task.task.filing.header.status !== FilingStatus.NEW
        }
      })
      return taskItem?.task
    }
    // else try to return pending todo item
    const taskItem = res.tasks.find((task) => {
      if ('todo' in task.task) {
        return task.task.todo.header.status === FilingStatus.NEW // TODO: confirm this is how you get active todos
      }
    })
    return taskItem?.task
  }

  /**
   * Fetches a filing by its id.
   * @param businessId the identifier of the business
   * @param filingId the id of the filing
   * @returns a promise to return the filing
   */
  async function getFilingById<T extends string, P>(
    businessId: string,
    filingId: number | string
  ): Promise<FilingGetByIdResponse<T, P>> {
    return $legalApi(`businesses/${businessId}/filings/${filingId}`)
  }

  /**
   * Fetches a filing by ID and validates that it is a usable draft of the expected type.
   *
   * @param businessId The identifier for the business.
   * @param draftId The ID of the draft filing to load.
   * @param filingName The name of the filing to validate for.
   * @returns A promise that resolves the draft filing response and if the filing is of the expected type.
  */
  async function getAndValidateDraftFiling<T extends string, P>(
    businessId: string,
    draftId: number | string,
    filingName: T
  ): Promise<{ isValid: boolean, data: FilingGetByIdResponse<T, P> | null }> {
      const response = await getFilingById(businessId, draftId)
      const isValid = isValidDraft<T, P>(filingName, response)

      if (!isValid) {
        return { isValid, data: null }
      }

      return { isValid, data: response }
  }

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
  ): Promise<FilingPostResponse<T, P>> {
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
    * Creates a new filing (POST) or updates an existing one (PUT).
    * This function handles both draft saves and final submissions based on the `isSubmission` flag.
    *
    * @param business - The business object.
    * @param filingName - The name of the filing.
    * @param payload - The data payload for the specific filing type.
    * @param isSubmission - If false, the filing is saved as draft. If true, it is submitted as final.
    * @param filingId - The filing Id to submit the PUT request against. Will submit a POST request if undefined.
    *
    * @returns A promise that resolves the API response.
  */
  // will return Promise<FilingPutResponse<T, P> if filingId is provided
  async function saveOrUpdateDraftFiling<T extends string, P>(
    business: BusinessData | BusinessDataSlim,
    filingName: T,
    payload: P,
    isSubmission: boolean,
    filingId: string | number
  ): Promise<FilingPutResponse<T, P>>
  // will return Promise<FilingPostResponse<T, P> if no filingId is provided
  async function saveOrUpdateDraftFiling<T extends string, P>(
    business: BusinessData | BusinessDataSlim,
    filingName: T,
    payload: P,
    isSubmission: boolean,
  ): Promise<FilingPostResponse<T, P>>
  // main function
  async function saveOrUpdateDraftFiling<T extends string, P>(
    business: BusinessData | BusinessDataSlim,
    filingName: T,
    payload: P,
    isSubmission = false,
    filingId?: string | number
  ): Promise<FilingPutResponse<T, P> | FilingPostResponse<T, P>> {
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

    const url = filingId
      ? `businesses/${business.identifier}/filings/${filingId}`
      : `businesses/${business.identifier}/filings`
    const method = filingId ? 'PUT' : 'POST'
    const query = isSubmission ? undefined : { draft: true }

    return $legalApi(url,
      {
        method,
        body: filingBody,
        query
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
    saveOrUpdateDraftFiling,
    getBusiness,
    getParties,
    getTasks,
    getPendingTask,
    getAndValidateDraftFiling
  }
}
