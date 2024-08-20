export const useAffiliations = () => {
  const accountStore = useConnectAccountStore()
  const { t } = useI18n()
  // const { getAffiliationInvitations } = useAffiliationInvitations()

  const affiliations = reactive({
    filters: {
      isActive: false,
      businessName: '',
      businessNumber: '',
      type: '',
      status: ''
    },
    loading: false,
    results: [] as Business[],
    count: 0
  })

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
    resetFilters()
  }

  function resetFilters () {
    affiliations.filters.businessName = ''
    affiliations.filters.businessNumber = ''
    affiliations.filters.type = ''
    affiliations.filters.status = ''
    affiliations.filters.isActive = false
  }

  const nameColumn = { key: 'legalName', label: 'Name' }
  const actionColumn = { key: 'actions', label: 'Actions' }

  const optionalColumns = [
    { key: 'identifier', label: t('labels.number') },
    { key: 'legalType', label: t('labels.type') },
    { key: 'state', label: t('labels.status') }
  ]

  const selectedColumns = ref([...optionalColumns])

  const visibleColumns = ref([
    nameColumn,
    ...optionalColumns,
    actionColumn
  ])

  const { width } = useWindowSize()

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
    { debounce: 500, immediate: true }
  )

  function setColumns () {
    visibleColumns.value = [
      nameColumn,
      ...optionalColumns.filter(col => selectedColumns.value.includes(col)),
      actionColumn
    ]
  }

  const filteredResults = computed(() => {
    let results = affiliations.results

    if (affiliations.filters.businessName) {
      results = results.filter((result) => {
        const businessName = affiliationName(result)
        return businessName.toLowerCase().includes(affiliations.filters.businessName.toLowerCase())
      })
    }

    if (affiliations.filters.businessNumber) {
      results = results.filter((result) => {
        const businessNumber = number(result)
        return businessNumber.toLowerCase().includes(affiliations.filters.businessNumber.toLowerCase())
      })
    }

    if (affiliations.filters.type) {
      results = results.filter((result) => {
        const type = affiliationType(result)
        return type.includes(affiliations.filters.type)
      })
    }

    if (affiliations.filters.status) {
      results = results.filter((result) => {
        const status = affiliationStatus(result)
        return status.includes(affiliations.filters.status)
      })
    }

    return results
  })

  const statusOptions = computed(() => {
    const optionSet = new Set<string>()

    affiliations.results.forEach((item) => {
      optionSet.add(affiliationStatus(item))
    })

    return Array.from(optionSet)
  })

  const typeOptions = computed(() => {
    const optionSet = new Set<string>()

    affiliations.results.forEach((item) => {
      optionSet.add(affiliationType(item))
    })

    return Array.from(optionSet)
  })

  const hasFilters = computed(() => {
    return affiliations.filters.businessName !== '' ||
      affiliations.filters.businessNumber !== '' ||
      affiliations.filters.type !== '' ||
      affiliations.filters.status !== ''
  })

  return {
    getAffiliatedEntities,
    affiliations,
    resetAffiliations,
    visibleColumns,
    optionalColumns,
    selectedColumns,
    setColumns,
    filteredResults,
    statusOptions,
    typeOptions,
    hasFilters,
    resetFilters
  }
}
