export const useAffiliations = () => {
  const accountStore = useConnectAccountStore()
  // const { getAffiliationInvitations } = useAffiliationInvitations()
  // const affStore = useAffiliationsStore()
  // const businessStore = useBusinessStore()
  // const businesses = computed(() => affStore.affiliations)

  /** V-model for dropdown menus of affiliation actions. */
  // const actionDropdown: Ref<boolean[]> = ref([])

  const affiliations = (reactive({
    filters: {
      isActive: false,
      filterPayload: {}
    } as AffiliationFilterParams,
    loading: false,
    results: [] as Business[],
    totalResults: 0
  }) as unknown) as AffiliationState

  // TODO: handle affiliation invitations
  // async function handleAffiliationInvitations (affiliatedEntities: Business[]): Promise<void> {
  //   // if (!LaunchDarklyService.getFlag(LDFlags.AffiliationInvitationRequestAccess)) {
  //   //   return affiliatedEntities
  //   // }

  //   const pendingAffiliationInvitations = await getAffiliationInvitations(accountStore.currentAccount.id) || []
  //   console.log(pendingAffiliationInvitations)
  //   // const includeAffiliationInviteRequest = LaunchDarklyService.getFlag(LDFlags.EnableAffiliationDelegation) || false

  //   for (const affiliationInvite of pendingAffiliationInvitations) {
  //     // Skip over affiliation requests for type REQUEST for now.
  //     // if (affiliationInvite.type === AffiliationInvitationType.REQUEST && !includeAffiliationInviteRequest) {
  //     //   continue
  //     // }
  //     const isFromOrg = affiliationInvite.fromOrg.id === Number(accountStore.currentAccount.id)
  //     const isToOrgAndPending = affiliationInvite.toOrg?.id === Number(accountStore.currentAccount.id) &&
  //       affiliationInvite.status === AffiliationInvitationStatus.Pending
  //     const isAccepted = affiliationInvite.status === AffiliationInvitationStatus.Accepted
  //     const business = affiliatedEntities.find(
  //       business => business.businessIdentifier === affiliationInvite.entity.businessIdentifier)

  //     if (business && (isToOrgAndPending || isFromOrg)) {
  //       business.affiliationInvites = (business.affiliationInvites || []).concat([affiliationInvite])
  //     } else if (!business && isFromOrg && !isAccepted) {
  //       // This returns corpType: 'BEN' instead of corpType: { code: 'BEN' }.
  //       const corpType = affiliationInvite.entity.corpType
  //       const newBusiness = {
  //         ...affiliationInvite.entity,
  //         affiliationInvites: [affiliationInvite],
  //         corpType: { code: corpType as unknown as string } as CorpType
  //       }
  //       affiliatedEntities.push(newBusiness)
  //     }
  //   }
  // }

  async function getAffiliatedEntities (): Promise<void> {
    const { $keycloak } = useNuxtApp()
    const authApiUrl = useRuntimeConfig().public.authApiURL
    // let affiliatedEntities: Business[] = []
    affiliations.results = []
    try {
      if (!accountStore.currentAccount.id) { return }
      const response = await $fetch<{ entities: AffiliationResponse[] }>(`${authApiUrl}/orgs/${accountStore.currentAccount.id}/affiliations?new=true`, {
        headers: {
          Authorization: `Bearer ${$keycloak.token}`
        }
      })

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
          affiliations.results.push(entity)

          // TODO: add affilaition invites to business object
          // affiliatedEntities = await handleAffiliationInvitations(affiliatedEntities)

          // affiliations.results = affiliatedEntities
        })
      }
    } catch (error) { // TODO: error handling
      throw new Error('Error fetching data from API: ' + error.message)
    }
  }

  onMounted(async () => {
    await getAffiliatedEntities()
  })

  watch(
    [() => accountStore.currentAccount.id],
    async () => {
      await getAffiliatedEntities()
    }
  )

  // /** Apply data table headers dynamically to account for computed properties. */
  // const getHeaders = (columns?: string[]) => {
  //   // headers.value = getAffiliationTableHeaders(columns)
  //   // const newHeaders: BaseTableHeaderI[] = headers.value.map((header: BaseTableHeaderI) => {
  //     const businesses_: Business[] = businesses.value
  //     if (header.col === 'Type') {
  //       const filterValue: { text: string, value: any }[] =
  //         businesses_.map(business => ({ text: type(business), value: type(business) }))
  //       return { ...header, customFilter: { ...header.customFilter, items: filterValue } }
  //     } else if (header.col === 'Status') {
  //       const filterValue: { text: string, value: any }[] =
  //         businesses_.map(business => ({ text: status(business), value: status(business) }))
  //       return { ...header, customFilter: { ...header.customFilter, items: filterValue } }
  //     } else if (header.col === 'Name') {
  //       const filterValue: { text: string, value: any }[] = businesses_.map((business) => {
  //         const businessName = isNameRequest(business)
  //           ? business.nameRequest.names.map(obj => obj.name).join(' ')
  //           : name(business)
  //         return { text: businessName, value: businessName }
  //       })
  //       return { ...header, customFilter: { ...header.customFilter, items: filterValue } }
  //     } else if (header.col === 'Number') {
  //       const filterValue: { text: string, value: any }[] =
  //         businesses_.map(business => ({ text: number(business), value: number(business) }))
  //       return { ...header, customFilter: { ...header.customFilter, items: filterValue } }
  //     } else {
  //       return { ...header }
  //     }
  //   })
  //   // headers.value = newHeaders
  // }

  // watch(businesses, () => {
  //   affiliations.results = businesses.value
  //   affiliations.totalResults = businesses.value.length
  //   // getHeaders()
  // }, { immediate: true })

  // const entityCount = computed(() => {
  //   return businesses.value.length
  // })

  // // get affiliated entities for this organization
  // const loadAffiliations = (filterField?: string, value?: any) => {
  //   affiliations.loading = true
  //   if (filterField) {
  //     affiliations.filters.filterPayload[filterField] = value
  //   }
  //   affiliations.totalResults = businesses.value.length
  //   affiliations.results = businesses.value
  //   affiliations.loading = false
  // }

  // const updateFilter = (filterField?: string, value?: any) => {
  //   if (filterField) {
  //     if (value) {
  //       affiliations.filters.filterPayload[filterField] = value
  //       affiliations.filters.isActive = true
  //     } else {
  //       delete affiliations.filters.filterPayload[filterField]
  //     }
  //   }
  //   if (Object.keys(affiliations.filters.filterPayload).length === 0) {
  //     affiliations.filters.isActive = false
  //   } else {
  //     affiliations.filters.isActive = true
  //   }
  //   actionDropdown.value = []
  // }

  // const clearAllFilters = () => {
  //   affiliations.filters.filterPayload = {}
  //   affiliations.filters.isActive = false
  //   actionDropdown.value = []
  // }

  return {
    getAffiliatedEntities,
    // entityCount,
    // loadAffiliations,
    affiliations
    // clearAllFilters,
    // getHeaders,
    // headers,
    // updateFilter,
    // actionDropdown
  }
}
