export const useAffiliations = () => {
  const accountStore = useConnectAccountStore()
  const { $keycloak, $authApi } = useNuxtApp()
  const authApiUrl = useRuntimeConfig().public.authApiURL
  const { t, locale } = useI18n()
  const toast = useToast()
  const brdModal = useBrdModals()
  const keycloak = reactive(useKeycloak())

  const affiliations = reactive({
    filters: {
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
    resetAffiliations()
    try {
      affiliations.loading = true

      if (!accountStore.currentAccount.id || !$keycloak.authenticated) { return }
      const response = await $authApi<{ entities: AffiliationResponse[] }>(`/orgs/${accountStore.currentAccount.id}/affiliations?new=true`)

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
    } finally {
      affiliations.loading = false
    }
  }

  // load new affiliations when user changes accounts
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
      resetFilters() // reset filters so active filters do not get hidden when screen size changes
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
      ...optionalColumns.filter(col => selectedColumns.value.includes(col)),
      actionColumn
    ]
  }

  const filteredResults = computed(() => {
    let results = affiliations.results

    if (affiliations.filters.businessName) {
      results = results.filter((result) => {
        const businessName = affiliationName(result)
        return businessName.toLocaleLowerCase(locale.value).includes(affiliations.filters.businessName.toLocaleLowerCase(locale.value))
      })
    }

    if (affiliations.filters.businessNumber) {
      results = results.filter((result) => {
        const businessNumber = number(result)
        return businessNumber.toLocaleLowerCase(locale.value).includes(affiliations.filters.businessNumber.toLocaleLowerCase(locale.value))
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

    // console.log('filtered results: ', results)
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
    return Object.values(affiliations.filters).some(value => value !== '')
  })

  function createNRAffiliation (affiliation: CreateNRAffiliationRequestBody) {
    const url = `${authApiUrl}/orgs/${accountStore.currentAccount.id}/affiliations?newBusiness=true`
    return $fetch(url, {
      headers: {
        Authorization: `Bearer ${$keycloak.token}`
      },
      method: 'POST',
      body: affiliation
    })
  }

  const isStaffOrSbcStaff = computed<boolean>(() => { // TODO: move this into core layer along with a 'hasRoles' function
    if (!$keycloak.authenticated) { return false }
    const currentOrgIsStaff = [AccountType.STAFF, AccountType.SBC_STAFF].includes(accountStore.currentAccount?.accountType)
    return currentOrgIsStaff || keycloak.kcUser.roles.includes(UserRole.Staff)
  })

  function handleManageBusinessOrNameRequest (searchType: string, event: { names: string[]; nrNum: string }) {
    if (searchType === 'reg') {
      console.log('open manage business modal')
    } else if (isStaffOrSbcStaff.value) {
      addNameRequestForStaffSilently(event.nrNum)
    } else {
      brdModal.openManageNameRequest(event)
    }
  }

  async function addNameRequestForStaffSilently (businessIdentifier: string) {
    try {
      await createNRAffiliation({ businessIdentifier })
      toast.add({ title: t('form.manageNR.successToast', { nrNum: businessIdentifier }) }) // add success toast
      await getAffiliatedEntities() // reload affiliated entities
    } catch (err) {
      console.error('Error adding name request: ', err)
      brdModal.openManageNRError() // show general nr error on staff add error
    }
  }

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
    resetFilters,
    createNRAffiliation,
    handleManageBusinessOrNameRequest
  }
}
