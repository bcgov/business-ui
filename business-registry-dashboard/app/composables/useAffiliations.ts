import {
  CorpTypeCd,
  GetCorpFullDescription,
  GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'
// import CommonUtils from '@/util/common-util'

// const affiliations = (reactive({
//   filters: {
//     isActive: false,
//     filterPayload: {}
//   } as AffiliationFilterParams,
//   loading: false,
//   results: [] as Business[],
//   totalResults: 0
// }) as unknown) as AffiliationState

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

  /** Returns true if the affiliation is a Name Request. */
  const isNameRequest = (business: Business): boolean => {
    return (business.corpType?.code === CorpTypes.NAME_REQUEST && !!business.nameRequest)
  }

  /** Returns true if the affiliation is a temporary business. */
  const isTemporaryBusiness = (business: Business): boolean => {
    return (
      (business.corpType?.code || business.corpType) === CorpTypes.AMALGAMATION_APPLICATION ||
      (business.corpType?.code || business.corpType) === CorpTypes.INCORPORATION_APPLICATION ||
      (business.corpType?.code || business.corpType) === CorpTypes.REGISTRATION
    )
  }

  // const isBusinessAffiliated = (businessIdentifier: string): boolean => {
  //   if (!businessIdentifier) {
  //     return false
  //   }
  //   return affiliations.results.some(business => businessIdentifier === business.businessIdentifier)
  // }

  // /** Returns the temp business description. */
  const tempDescription = (business: Business): string => {
    switch ((business.corpType?.code || business.corpType) as CorpTypes) {
      case CorpTypes.AMALGAMATION_APPLICATION:
        return AffiliationTypes.AMALGAMATION_APPLICATION
      case CorpTypes.INCORPORATION_APPLICATION:
        return AffiliationTypes.INCORPORATION_APPLICATION
      case CorpTypes.REGISTRATION:
        return AffiliationTypes.REGISTRATION
      default:
        return '' // should never happen
    }
  }

  // /** Returns the type of the affiliation. */
  const type = (business: Business): string => {
    if (isTemporaryBusiness(business)) {
      return tempDescription(business)
    }
    if (isNameRequest(business)) {
      return AffiliationTypes.NAME_REQUEST
    }
    const code: unknown = business.corpType.code
    return GetCorpFullDescription(code as CorpTypeCd)
  }

  // /** Returns the status of the affiliation. */
  // const status = (business: Business): string => {
  //   if (isTemporaryBusiness(business)) {
  //     return BusinessState.DRAFT
  //   }
  //   if (isNameRequest(business)) {
  //     // Format name request state value
  //     const state = NrState[(business.nameRequest.state)?.toUpperCase()]
  //     if (!state) { return 'Unknown' }
  //     if (state === NrState.INPROGRESS) { return NrDisplayStates.DRAFT }
  //     if (state === NrState.APPROVED && (!business.nameRequest.expirationDate)) { return NrDisplayStates.PROCESSING } else if (business.corpType.code === CorpTypes.INCORPORATION_APPLICATION ||
  //             business.corpType.code === CorpTypes.REGISTRATION ||
  //             state === NrState.DRAFT) {
  //       return NrDisplayStates[NrState.HOLD]
  //     } else { return NrDisplayStates[state] || 'Unknown' }
  //   }
  //   if (business.status) {
  //     return business.status.charAt(0)?.toUpperCase() + business.status?.slice(1)?.toLowerCase()
  //   }
  //   return BusinessState.ACTIVE
  // }

  // /** Returns true if the affiliation is a numbered IA. */
  const isNumberedIncorporationApplication = (item: Business): boolean => {
    if (!item.corpSubType?.code) {
      return false
    }
    return (
      (item.corpType?.code) === CorpTypes.INCORPORATION_APPLICATION &&
      !item.nrNumber &&
      [CorpTypes.BENEFIT_COMPANY,
        CorpTypes.BC_ULC_COMPANY,
        CorpTypes.BC_COMPANY,
        CorpTypes.BC_CCC
      ].includes(item.corpSubType?.code)
    )
  }

  // /** Returns the identifier of the affiliation. */
  const number = (business: Business): string => {
    if (isNumberedIncorporationApplication(business)) {
      return AffidavitNumberStatus.PENDING
    }
    if (isTemporaryBusiness(business) || isNameRequest(business)) {
      return business.nameRequest?.nrNumber || business.nrNumber || ''
    }
    return business.businessIdentifier
  }

  const getApprovedName = (business: Business): string => {
    const approvedNameObj = business.nameRequest?.names?.find(each => each.state === NrState.APPROVED)
    const approvedName = approvedNameObj?.name
    return approvedName || ''
  }

  /** Returns the name of the affiliation. */
  const name = (item: Business): string => {
    if (isNumberedIncorporationApplication(item)) {
      const legalType: unknown = item.corpSubType?.code
      // provide fallback for old numbered IAs without corpSubType
      return GetCorpNumberedDescription(legalType as CorpTypeCd) || 'Numbered Company'
    }
    if (item.nameRequest) {
      return getApprovedName(item)
    }
    return item.name ?? ''
  }

  // /** Returns the type description. */
  const typeDescription = (business: Business): string => {
    // if this is a name request then show legal type
    if (isNameRequest(business)) {
      const legalType: unknown = business.nameRequest?.legalType
      return GetCorpFullDescription(legalType as CorpTypeCd)
    }
    // if this is an IA or registration then show legal type
    if (isTemporaryBusiness(business)) {
      const legalType: unknown = (business.corpSubType?.code || business.corpSubType)
      return GetCorpFullDescription(legalType as CorpTypeCd) // may return ''
    }
    // else show nothing
    return ''
  }

  // /** Returns true if the affiliation is approved to start an IA or Registration. */
  // const canUseNameRequest = (business: Business): boolean => {
  //   // Split string tokens into an array to avoid false string matching
  //   // const supportedEntityFlags = LaunchDarklyService.getFlag(LDFlags.IaSupportedEntities)?.split(' ') || []
  //   return (
  //     isNameRequest(business) && // Is this a Name Request
  //     business.nameRequest.enableIncorporation && // Is the Nr state approved (conditionally) or registration
  //     // supportedEntityFlags.includes(business.nameRequest.legalType) && // Feature flagged Nr types
  //     !!business.nameRequest.expirationDate // Ensure NR isn't processing still
  //   )
  // }

  /** Returns the Name Request type using the NR action code or the NR type code */
  const nameRequestType = (business: Business): string => {
    let nrType: string = ''
    if (isNameRequest(business) && business.nameRequest?.requestActionCd) {
      // Try action code first, and if not found in the enum then use type code
      nrType = mapRequestActionCdToNrType(business.nameRequest?.requestActionCd)
      if (business.nameRequest?.requestTypeCd) {
        nrType = nrType || mapRequestTypeCdToNrType(business.nameRequest?.requestTypeCd)
      }
      if (nrType) {
        const emDash = '—' // ALT + 0151
        return `${emDash} ${nrType}`
      }
    }
    return nrType
  }

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

  // const getEntityType = (item: Business): CorpTypes => {
  //   let entityType = item.corpType.code
  //   if (isNameRequest(item)) {
  //     entityType = item.nameRequest?.legalType
  //   }
  //   return entityType
  // }

  return {
    getAffiliatedEntities,
    // entityCount,
    // loadAffiliations,
    affiliations,
    // clearAllFilters,
    // getHeaders,
    type,
    // status,
    // headers,
    // updateFilter,
    typeDescription,
    isNameRequest,
    nameRequestType,
    number,
    name
    // canUseNameRequest,
    // tempDescription,
    // isTemporaryBusiness,
    // getEntityType,
    // isBusinessAffiliated
    // actionDropdown
  }
}
