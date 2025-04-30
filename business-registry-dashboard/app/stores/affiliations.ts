// import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'
import { FetchError } from 'ofetch'
import { EntityStates } from '@bcrs-shared-components/enums'

export const useAffiliationsStore = defineStore('brd-affiliations-store', () => {
  const accountStore = useConnectAccountStore()
  const { $keycloak, $authApi, $legalApi } = useNuxtApp()
  const { t, locale } = useI18n()
  const toast = useToast()
  const brdModal = useBrdModals()
  const keycloak = reactive(useKeycloak())
  const ldStore = useConnectLaunchdarklyStore()
  const route = useRoute()

  const affiliations = reactive({
    filters: {
      businessName: '',
      businessNumber: '',
      type: [] as string[],
      status: [] as string[]
    },
    pagination: {
      page: 1,
      limit: 100,
      sortBy: '',
      sortDesc: false
    } as PaginationOptions,
    loading: true,
    results: [] as Business[],
    count: 0,
    totalResults: 0,
    error: false
  })

  // Pagination limit options
  const paginationLimitOptions = ref([
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 }
  ])

  // Flag for whether server-side filtering is enabled
  const enableServerFiltering = computed(() =>
    ldStore.getStoredFlag(LDFlags.EnableAffiliationsServerFiltering) || false
  )

  // Flag for whether pagination is enabled
  const enablePagination = computed(() =>
    ldStore.getStoredFlag(LDFlags.EnableAffiliationsPagination) || false
  )

  const newlyAddedIdentifier = ref<string>('')

  function removeAffiliation (orgIdentifier: number, incorporationNumber: string, passcodeResetEmail?: string, resetPasscode?: boolean) {
    return $authApi(`/orgs/${orgIdentifier}/affiliations/${incorporationNumber}`, {
      method: 'DELETE',
      body: {
        data: { passcodeResetEmail, resetPasscode, logDeleteDraft: true }
      }
    })
  }

  function getFilings (businessNumber: string) {
    return $legalApi(`/businesses/${businessNumber}/filings`)
  }

  function deleteBusinessFiling (businessNumber: string, filingId: string) {
    return $legalApi(`/businesses/${businessNumber}/filings/${filingId}`, { method: 'DELETE' })
  }

  // Interface for filing response to fix typing issue
  interface FilingResponse {
    filing?: {
      header?: {
        filingId?: string
      }
    }
  }

  async function removeBusiness (payload: RemoveBusinessPayload) {
    const orgId = (route.params.orgId && isStaffOrSbcStaff.value) ? route.params.orgId : payload.orgIdentifier
    // If the business is a new IA, amalgamation, or registration then remove the business filing from legal-db
    if ([
      CorpTypes.INCORPORATION_APPLICATION,
      CorpTypes.AMALGAMATION_APPLICATION,
      CorpTypes.REGISTRATION,
      CorpTypes.CONTINUATION_IN
    ].includes(payload.business.corpType.code)) {
      const filingResponse = await getFilings(payload.business.businessIdentifier) as FilingResponse
      if (filingResponse) {
        const filingId = filingResponse.filing?.header?.filingId
        // If there is a filing delete it which will delete the affiliation, else delete the affiliation
        const deleteBusiness = canBusinessBeDeleted(payload)
        if (filingId && deleteBusiness) {
          await deleteBusinessFiling(payload.business.businessIdentifier, filingId)
        } else {
          const businessIdentifier = payload.business.businessIdentifier || payload.business.nameRequest?.nrNumber
          await removeAffiliation(orgId as number, businessIdentifier!, payload.passcodeResetEmail, payload.resetPasscode)
        }
      }
    } else {
      // Remove an affiliation between the given business and each specified org
      const businessIdentifier = payload.business.businessIdentifier || payload.business.nameRequest?.nrNumber
      await removeAffiliation(orgId as number, businessIdentifier!, payload.passcodeResetEmail, payload.resetPasscode)
    }
  }

  /* Check if Business can be deleted safely. */
  function canBusinessBeDeleted (payload: RemoveBusinessPayload) {
    const { draftStatus, corpType } = payload.business

    // Allow deletion if there's no draft status
    if (!draftStatus) {
      return true
    }

    // Don't allow deletion if:
    // 1. It's withdrawn, or
    // 2. It's a continuation in with non-draft status since only draft records can be deleted
    return draftStatus !== EntityStates.WITHDRAWN &&
           !(corpType.code === CorpTypes.CONTINUATION_IN && draftStatus !== EntityStates.DRAFT)
  }

  function removeInvite (inviteId: number) {
    return $authApi(`/affiliationInvitations/${inviteId}`, {
      method: 'DELETE'
    })
  }

  /** Remove Accepted affiliation invitations from business. */
  async function removeAcceptedAffiliationInvitations (business: Business) {
    const invitations = business.affiliationInvites || []
    for (const affiliationInvitation of invitations) {
      if (affiliationInvitation.status === AffiliationInvitationStatus.Accepted) {
        await removeInvite(affiliationInvitation.id)
      }
    }
  }

  async function handleAffiliationInvitations (affiliatedEntities: Business[]): Promise<Business[]> {
    const currentAccountId = Number(accountStore.currentAccount.id)
    if (!ldStore.getStoredFlag(LDFlags.AffiliationInvitationRequestAccess)) {
      return affiliatedEntities
    }

    const pendingInvites = await $authApi<{ affiliationInvitations: AffiliationInviteInfo[] }>('/affiliationInvitations', {
      params: {
        orgId: currentAccountId,
        businessDetails: true
      }
    }).catch((error) => {
      logFetchError(error, 'Error retrieving affiliation invitations')
    })
    const includeAffiliationInviteRequest = ldStore.getStoredFlag(LDFlags.EnableAffiliationDelegation) || false

    if (pendingInvites && pendingInvites.affiliationInvitations.length > 0) {
      for (const invite of pendingInvites.affiliationInvitations) {
      // Skip over affiliation requests for type REQUEST for now.
        if (invite.type === AffiliationInvitationType.REQUEST && !includeAffiliationInviteRequest) {
          continue
        }
        const isFromOrg = invite.fromOrg.id === currentAccountId
        const isToOrgAndPending = invite.toOrg?.id === currentAccountId &&
        invite.status === AffiliationInvitationStatus.Pending
        const isAccepted = invite.status === AffiliationInvitationStatus.Accepted
        const business = affiliatedEntities.find(
          business => business.businessIdentifier === invite.entity.businessIdentifier)
        if (business && (isToOrgAndPending || isFromOrg)) {
          business.affiliationInvites = (business.affiliationInvites || []).concat([invite])
        } else if (!business && isFromOrg && !isAccepted) {
        // This returns corpType: 'BEN' instead of corpType: { code: 'BEN' }.
          const corpType = invite.entity.corpType
          const newBusiness = {
            ...invite.entity,
            affiliationInvites: [invite],
            corpType: { code: corpType as unknown as string } as CorpType
          }
          affiliatedEntities.push(newBusiness)
        }
      }
    }

    return sortEntitiesByInvites(affiliatedEntities)
  }

  async function loadAffiliations (): Promise<void> {
    // Only reset if server-side filtering/pagination is disabled
    const shouldUseServerFeatures = enableServerFiltering.value && enablePagination.value
    if (!shouldUseServerFeatures) {
      resetAffiliations()
    }
    affiliations.results = []
    affiliations.count = 0

    try {
      affiliations.loading = true
      affiliations.error = false

      if (!accountStore.currentAccount.id || !$keycloak.authenticated) { return }

      // Use route param if staff, otherwise use current account
      const orgId = (isStaffOrSbcStaff.value && route.params.orgId)
        ? route.params.orgId
        : accountStore.currentAccount.id

      if (!orgId) { return }

      // Build the query URL with filters and pagination if enabled
      let url = `/orgs/${orgId}/affiliations?new=true`

      // Add filters if server-side filtering is enabled
      if (enableServerFiltering.value) {
        if (affiliations.filters.businessName) {
          url += `&name=${encodeURIComponent(affiliations.filters.businessName)}`
        }
        if (affiliations.filters.businessNumber) {
          url += `&identifier=${encodeURIComponent(affiliations.filters.businessNumber)}`
        }
        if (affiliations.filters.status.length > 0) {
          // Add each status as a separate query parameter
          // This will output: ?status=Active&status=Expired&status=Approved
          affiliations.filters.status.forEach((status) => {
            url += `&status=${encodeURIComponent(status)}`
          })
        }
        if (affiliations.filters.type.length > 0) {
          // Add each type as a separate query parameter
          // This will output: ?type=BEN&type=CP&type=BC
          affiliations.filters.type.forEach((type) => {
            // Map display name to corresponding type code
            const typeCode = DisplayNameToCorpType[type as keyof typeof DisplayNameToCorpType] || type
            url += `&type=${encodeURIComponent(typeCode)}`
          })
        }
      }

      // Add pagination if enabled
      if (enablePagination.value) {
        url += `&page=${affiliations.pagination.page}`
        url += `&limit=${affiliations.pagination.limit}`
        if (affiliations.pagination.sortBy) {
          url += `&sortBy=${affiliations.pagination.sortBy}`
          url += `&sortDesc=${affiliations.pagination.sortDesc}`
        }
      }

      const response = await $authApi<{ entities: AffiliationResponse[], totalResults?: number }>(url)

      let affiliatedEntities: Business[] = []

      if (response.entities.length > 0) {
        response.entities.forEach((resp) => {
          const entity: Business = buildBusinessObject(resp)
          if (resp.nameRequest) {
            const nr = resp.nameRequest
            if (!entity.nrNumber && nr.nrNum) {
              entity.nrNumber = entity.nrNumber || nr.nrNum
            }
            entity.nameRequest = buildNameRequestObject(nr)
          }
          affiliatedEntities.push(entity)
        })

        affiliatedEntities = await handleAffiliationInvitations(affiliatedEntities)

        affiliations.results = affiliatedEntities
        affiliations.count = affiliatedEntities.length

        if (newlyAddedIdentifier.value.length >= 1) {
          highlightNewAffiliation()
        }

        // Set total results if pagination is enabled and the server returns it
        if (enablePagination.value && response.totalResults) {
          affiliations.totalResults = response.totalResults
        } else {
          affiliations.totalResults = affiliations.count
        }
      } else {
        affiliations.totalResults = 0
      }
    } catch (error) {
      logFetchError(error, 'Error retrieving businesses')
      affiliations.error = true
    } finally {
      affiliations.loading = false
    }
  }

  // Watch for changes to account, filters, or pagination with debounce
  // This prevents multiple rapid successive API calls
  // For example: when user is typing in the business name filter,
  // the API is called with the final value after the user has stopped typing
  watchDebounced(
    [
      () => accountStore.currentAccount.id,
      () => enableServerFiltering.value ? affiliations.filters : null,
      () => enablePagination.value ? affiliations.pagination : null
    ],
    async () => {
      await loadAffiliations()
    },
    { debounce: 400, deep: true } // 400ms debounce time - wait for all changes to settle before calling API
  )

  // Separate watch for immediately resetting page when limit changes
  // This doesn't trigger an API call directly but affects the pagination object
  // which is picked up by the debounced watcher above
  watch(
    () => affiliations.pagination.limit,
    () => {
      // Reset to page 1 when limit changes to prevent accessing non-existent pages
      affiliations.pagination.page = 1
    }
  )

  // Reset to page 1 whenever any filter changes if server-side filtering is enabled
  watch(
    () => affiliations.filters,
    () => {
      // Reset to page 1 when any filter changes to prevent accessing non-existent pages
      if (enableServerFiltering.value) {
        affiliations.pagination.page = 1
      }
    },
    { deep: true }
  )

  // Mark any new affiliation on the list.
  function highlightNewAffiliation () {
    const newIdentifier = newlyAddedIdentifier.value
    const firstResult = affiliations.results?.[0] as any

    // Skip if no results or no new identifier
    if (!firstResult) { return }
    // If the first result matches the newly added business or name request, highlight it
    if (newIdentifier && (firstResult.businessIdentifier === newIdentifier)) {
      firstResult.class = 'bg-[#E8F5E9]'
      // Remove highlight and clear identifier
      setTimeout(() => {
        newlyAddedIdentifier.value = ''
      }, 4000)
    } else {
      // Clear any existing highlight
      firstResult.class = ''
    }
  }

  function resetAffiliations () {
    affiliations.loading = false
    affiliations.results = []
    affiliations.count = 0
    affiliations.totalResults = 0
    affiliations.error = false
    resetFilters()
  }

  function resetFilters () {
    affiliations.filters.businessName = ''
    affiliations.filters.businessNumber = ''
    affiliations.filters.type = []
    affiliations.filters.status = []
  }

  // label required for columns type but overwritten in header slot, i18n not required
  const nameColumn = { key: 'legalName', label: 'Name' }
  const actionColumn = { key: 'actions', label: 'Actions' }

  // optional table columns, i18n required because this is also used to populate the 'columns to show' dropdown
  const optionalColumns = [
    { key: 'identifier', label: t('labels.number') },
    { key: 'legalType', label: t('labels.type') },
    { key: 'state', label: t('labels.status') }
  ]

  // default user selectedColumns columns = optionalColumns
  const selectedColumns = ref([...optionalColumns])

  // default visible columns as all columns
  const visibleColumns = ref([
    nameColumn,
    ...optionalColumns,
    actionColumn
  ])

  const { width } = useWindowSize()

  // update default columns on page width change
  watchDebounced(
    width,
    (newVal) => {
      if (newVal < 640) {
        // Mobile view
        visibleColumns.value = [nameColumn, actionColumn]
        selectedColumns.value = []
      } else if (newVal < 1024) {
        // Tablet view
        visibleColumns.value = [
          nameColumn,
          optionalColumns[0]!,
          actionColumn
        ]
        selectedColumns.value = [optionalColumns[0]!]
      } else {
        // Desktop view
        selectedColumns.value = [...optionalColumns]
        visibleColumns.value = [
          nameColumn,
          ...optionalColumns,
          actionColumn
        ]
      }
    },
    { debounce: 100, immediate: true }
  )

  // used to update columns @change on the 'columns to show' dropdown
  function setColumns () {
    visibleColumns.value = [
      nameColumn,
      ...optionalColumns.filter(col => selectedColumns.value.some(sel => sel.key === col.key)),
      actionColumn
    ]
  }

  // Returns filtered affiliations based on current filter criteria
  const filteredResults = computed(() => {
    // Skip client-side filtering if server-side filtering is enabled
    if (enableServerFiltering.value) {
      return affiliations.results
    }

    let results = affiliations.results

    // Filter by business name (case-insensitive partial match)
    if (affiliations.filters.businessName) {
      results = results.filter((result) => {
        const businessName = affiliationName(result)
        return businessName.toLocaleLowerCase(locale.value).includes(affiliations.filters.businessName.toLocaleLowerCase(locale.value))
      })
    }

    // Filter by business number (case-insensitive partial match)
    if (affiliations.filters.businessNumber) {
      results = results.filter((result) => {
        const businessNumber = number(result)
        return businessNumber.toLocaleLowerCase(locale.value).includes(affiliations.filters.businessNumber.toLocaleLowerCase(locale.value))
      })
    }

    // Filter by business type (exact match from selected options)
    if (affiliations.filters.type.length > 0) {
      results = results.filter((result) => {
        const type = affiliationType(result)
        return affiliations.filters.type.includes(type)
      })
    }

    // Filter by business status (exact match from selected options)
    if (affiliations.filters.status.length > 0) {
      results = results.filter((result) => {
        const status = affiliationStatus(result)
        return affiliations.filters.status.includes(status)
      })
    }

    return results
  })

  // create status filter options relevant to affiliations.results
  const statusOptions = computed(() => {
    return Array.from(new Set(affiliations.results.map(affiliationStatus)))
  })

  // create type filter options relevant to affiliations.results
  const typeOptions = computed(() => {
    return Array.from(new Set(affiliations.results.map(affiliationType)))
  })

  const hasFilters = computed(() => {
    return (
      !!affiliations.filters.businessName ||
      !!affiliations.filters.businessNumber ||
      affiliations.filters.type.length > 0 ||
      affiliations.filters.status.length > 0
    )
  })

  function createAffiliation (affiliation: CreateAffiliationRequestBody) {
    const orgId = (route.params.orgId && isStaffOrSbcStaff.value) ? route.params.orgId : accountStore.currentAccount.id
    return $authApi(`/orgs/${orgId}/affiliations`, {
      method: 'POST',
      body: affiliation
    })
  }

  function createNRAffiliation (affiliation: CreateNRAffiliationRequestBody) {
    const orgId = (route.params.orgId && isStaffOrSbcStaff.value) ? route.params.orgId : accountStore.currentAccount.id
    return $authApi(`/orgs/${orgId}/affiliations?newBusiness=true`, {
      method: 'POST',
      body: affiliation
    })
  }

  const isStaffOrSbcStaff = computed<boolean>(() => { // TODO: move this into core layer along with a 'hasRoles' function
    if (!$keycloak.authenticated) { return false }
    const currentOrgIsStaff = [AccountType.STAFF, AccountType.SBC_STAFF].includes(accountStore.currentAccount?.accountType)
    return currentOrgIsStaff || keycloak.kcUser.roles.includes(UserRole.Staff)
  })

  async function handleManageBusinessOrNameRequest (
    searchType: 'reg' | 'namex',
    event: ManageNameRequestEvent | ManageBusinessEvent
  ) {
    if (searchType === 'reg' && 'identifier' in event) {
      if (isStaffOrSbcStaff.value) {
        await addBusinessForStaffSilently(event.identifier)
      } else {
        brdModal.openManageBusiness(event)
      }
    } else if (searchType === 'namex' && 'nrNum' in event) {
      if (isStaffOrSbcStaff.value) {
        await addNameRequestForStaffSilently(event.nrNum)
      } else {
        brdModal.openManageNameRequest(event)
      }
    } else {
      console.error('Incorrect event type') // should never happen
    }
  }

  async function addNameRequestForStaffSilently (businessIdentifier: string) {
    try {
      await createNRAffiliation({ businessIdentifier })
      toast.add({ title: t('form.manageNR.successToast', { nrNum: businessIdentifier }) }) // add success toast
      await loadAffiliations() // reload affiliated entities
      newlyAddedIdentifier.value = businessIdentifier
    } catch (error) {
      logFetchError(error, 'Error adding name request')
      const e = error as FetchError
      const msg = e.data?.message ?? ''
      toast.add({ title: t('toast.unableToAddNr'), description: msg })
    }
  }

  async function addBusinessForStaffSilently (businessIdentifier: string) {
    try {
      await createAffiliation({ businessIdentifier })
      toast.add({ title: `${businessIdentifier} successfully added to your list` }) // add success toast
      await loadAffiliations() // reload affiliated entities
      newlyAddedIdentifier.value = businessIdentifier
    } catch (error) {
      logFetchError(error, 'Error adding business')
      const e = error as FetchError
      const msg = e.data?.message ?? ''
      toast.add({ title: t('toast.unableToAddBusiness'), description: msg })
    }
  }

  /* Internal function for sorting affiliations / entities by invites. */
  function sortEntitiesByInvites (affiliatedEntities: Business[]): Business[] {
    // bubble the ones with the invitations to the top
    affiliatedEntities?.sort((a, b) => {
      if (a.affiliationInvites && !b.affiliationInvites) {
        return -1
      }
      if (!a.affiliationInvites && b.affiliationInvites) {
        return 1
      }
      return 0
    })
    return affiliatedEntities
  }

  // need to get business identifier in the args
  async function resendAffiliationInvitation (event: Business) {
    const invite = event.affiliationInvites?.[0]
    // let invitationId = ''
    const invitationId = ''

    // if (this.base64Token && this.base64OrgName) { // TODO: implement base 64 token from magic link
    //   const base64TokenObject = this.base64Token.split('.')[0]
    //   const decodedToken = Base64.decode(base64TokenObject)
    //   const token = JSON.parse(decodedToken)
    //   invitationId = token.id
    // }

    try {
      const affiliationInvitationId = invitationId || invite?.id || ''
      await $authApi(`/affiliationInvitations/${affiliationInvitationId}`, {
        method: 'PATCH',
        body: {} // empty body required
      })

      if (invite?.recipientEmail === undefined) { // show toast if no email in the event object
        toast.add({ title: t('form.manageBusiness.toast.emailSent') })
      } else { // else open confirmation/instructions modal
        brdModal.openAuthEmailSent(invite.recipientEmail)
      }
    } catch (error) {
      logFetchError(error, 'Error resending affiliation invitation')
      const e = error as FetchError
      const msg = e.data?.message ?? ''
      toast.add({ title: t('toast.errorResendingAffInvite'), description: msg })
    }
  }

  async function deletePendingInvitations (businessIdentifier: string) {
    try {
      const { affiliationInvitations = [] } = await $authApi<{ affiliationInvitations: AffiliationInviteInfo[] }>('/affiliationInvitations', {
        params: {
          orgId: accountStore.currentAccount.id,
          businessDetails: true,
          status: AffiliationInvitationStatus.Pending
        }
      })

      const pendingInvites = affiliationInvitations.filter(invite => businessIdentifier === invite.entity.businessIdentifier)

      if (pendingInvites.length > 0) {
        await Promise.all(pendingInvites.map(async (invite) => {
          await removeInvite(invite.id).catch(error => logFetchError(error, `Error deleting invite with ID ${invite.id}`)
          )
        }))

        // reload if at least one invite was deleted
        await loadAffiliations()
      }
    } catch (error) {
      logFetchError(error, 'Error deleting existing affiliation invitations')
    }
  }

  function $reset () {
    resetAffiliations()
    resetFilters()
  }

  return {
    removeInvite,
    removeAcceptedAffiliationInvitations,
    loadAffiliations,
    affiliations,
    resetAffiliations,
    visibleColumns,
    optionalColumns,
    selectedColumns,
    isStaffOrSbcStaff,
    setColumns,
    filteredResults,
    statusOptions,
    typeOptions,
    hasFilters,
    resetFilters,
    createNRAffiliation,
    createAffiliation,
    handleManageBusinessOrNameRequest,
    removeBusiness,
    canBusinessBeDeleted,
    removeAffiliation,
    getFilings,
    deleteBusinessFiling,
    addNameRequestForStaffSilently,
    handleAffiliationInvitations,
    sortEntitiesByInvites,
    resendAffiliationInvitation,
    deletePendingInvitations,
    newlyAddedIdentifier,
    paginationLimitOptions,
    enablePagination,
    $reset
  }
}
// { persist: true } // persist store values in session storage
)
