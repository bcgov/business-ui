export const useAffiliations = () => {
  const accountStore = useConnectAccountStore()
  // const { getAffiliationInvitations } = useAffiliationInvitations()

  const affiliations = (reactive({
    filters: {
      isActive: false,
      filterPayload: {}
    } as AffiliationFilterParams,
    loading: false,
    results: [] as Business[],
    count: 0
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
    resetAffiliations()
    try {
      if (!accountStore.currentAccount.id || !$keycloak.authenticated) { return }
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
          affiliations.count = affiliations.results.length
          // TODO: add affilaition invites to business object
          // affiliatedEntities = await handleAffiliationInvitations(affiliatedEntities)

          // affiliations.results = affiliatedEntities
        })
      }
    } catch (error) { // TODO: error handling
      throw new Error('Error fetching data from API: ' + error.message)
    }
  }

  watch(
    [() => accountStore.currentAccount.id],
    async () => {
      await getAffiliatedEntities()
    },
    { immediate: true }
  )

  function resetAffiliations () {
    affiliations.loading = false
    affiliations.results = []
    affiliations.count = 0
    affiliations.filters.filterPayload = {}
    affiliations.filters.isActive = false
  }

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
  // }

  // const clearAllFilters = () => {
  //   affiliations.filters.filterPayload = {}
  //   affiliations.filters.isActive = false
  // }

  return {
    getAffiliatedEntities,
    // entityCount,
    affiliations
    // clearAllFilters,
    // updateFilter,
  }
}
