import { cloneDeep } from 'es-toolkit'

export const useTransitionStore = defineStore('transition-store', () => {
  const service = useBusinessService()
  const { tableState: tableParties } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const { tableState: tableShareClasses } = useManageShareStructure()
  const { getBusinessAddresses } = useBusinessAddresses()
  // const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  // const draftFilingState = shallowRef({}) // TODO: add type

  const formState = reactive<TransitionFormSchema>({} as TransitionFormSchema)
  const initialFormState = shallowRef<TransitionFormSchema>({} as TransitionFormSchema)
  const initialDirectors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialShareClasses = shallowRef<TableBusinessState<ShareClassSchema>[]>([])

  const isStaff = computed(() => useConnectAccountStore().currentAccount.accountType === AccountType.STAFF)

  async function init(businessId: string, filingSubType?: ReceiverType, draftId?: string) {
    initializing.value = true
    $reset()

    const {
      // draftFiling,
      parties
    } = await initFiling( // TODO: add type
      businessId,
      FilingType.TRANSITION,
      undefined,
      draftId,
      { roleType: RoleType.DIRECTOR }
    )

    // TODO: add table config option to useFiling addresses param
    const addresses = await getBusinessAddresses(businessId, 'table', [OfficeType.RECORDS, OfficeType.REGISTERED])
    const classes = await service.getShareClasses(businessId)

    // TODO: load/check/merge draft state
    // const draft = draftFiling?.filing?.changeOfReceivers
    // if (draft) {
    //   draftFilingState.value = draftFiling
    //   formState.staffPayment = formatStaffPaymentUi(draftFiling.filing.header)
    //   formState.courtOrder = formatCourtOrderUi(draft.courtOrder)
    //   formState.documentId.documentIdNumber = draft.documentId ?? ''
    // }

    if (parties) { // TODO: load/check/merge draft state
      // const draftRelationships = draft?.relationships
      // tableParties.value = draftRelationships
      //   ? getPartiesMergedWithRelationships(parties, draftRelationships)
      //   : parties
      tableParties.value = parties
    }

    if (addresses) { // TODO: load/check/merge draft state
      tableOffices.value = addresses
    }

    if (classes) { // TODO: load/check/merge draft state
      tableShareClasses.value = formatShareClassesUi(classes)
    }

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = cloneDeep(tableParties.value)
    initialShareClasses.value = cloneDeep(tableShareClasses.value)
    initializing.value = false
  }

  // TODO: implement submit
  async function submit(isSubmission: boolean) {
    const transitionPayload: TransitionPayload = {
      relationships: tableParties.value.map(relationship => formatRelationshipApi(relationship.new)),
      offices: {
        registeredOffice: {
          deliveryAddress: formatAddressApi(
            tableOffices.value.find(o => o.new.type === 'registeredOffice')?.new.address.deliveryAddress
          ),
          mailingAddress: formatAddressApi(
            tableOffices.value.find(o => o.new.type === 'registeredOffice')?.new.address.mailingAddress
          )
        },
        recordsOffice: {
          deliveryAddress: formatAddressApi(
            tableOffices.value.find(o => o.new.type === 'recordsOffice')?.new.address.deliveryAddress
          ),
          mailingAddress: formatAddressApi(
            tableOffices.value.find(o => o.new.type === 'recordsOffice')?.new.address.mailingAddress
          )
        }
      },
      hasProvisions: true,
      shareStructure: {
        shareClasses: tableShareClasses.value
          .filter(c => !c.new.actions.includes(ActionType.REMOVED))
          .map(c => ({
            ...c.new,
            name: c.new.name + ' Shares',
            series: c.new.series
              .filter(s => !s.actions.includes(ActionType.REMOVED))
              .map(s => ({
                ...s,
                name: s.name + ' Shares'
              }))
          }))
      },
      ...(formState.documentDelivery?.completingPartyEmail && {
        contactPoint: { email: formState.documentDelivery.completingPartyEmail }
      })
    }

    const filingPayload = businessApi.createFilingPayload(
      businessStore.business!,
      FilingType.TRANSITION,
      { transition: transitionPayload },
      isStaff.value ? formatStaffPaymentApi(formState.staffPayment!) : undefined
    )

    console.log(filingPayload)

    // const draftId = draftFilingState.value?.filing?.header?.filingId
    // if (draftId || !isSubmission) {
    //   const filingResp = await businessApi.saveOrUpdateDraftFiling(
    //     businessStore.businessIdentifier!,
    //     payload,
    //     isSubmission,
    //     draftId as string | number
    //   )
    //   draftFilingState.value = filingResp as unknown as ReceiverDraftState
    //   const urlParams = useUrlSearchParams()
    //   urlParams.draft = String(filingResp.filing.header.filingId)
    // } else {
    await businessApi.postFiling(businessStore.businessIdentifier!, filingPayload)
    // }
  }

  function $reset() {
    const defaults = getTransitionSchema(isStaff.value).parse({})
    Object.assign(formState, defaults)
    formState.activeDirector = undefined
    formState.activeClass = undefined
    formState.activeSeries = undefined
    formState.confirmDirectors = false
    formState.confirmOffices = false

    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = []
    initialShareClasses.value = []
  }

  return {
    formState,
    initializing,
    directors: tableParties,
    offices: tableOffices,
    shareClasses: tableShareClasses,
    initialFormState,
    initialDirectors,
    initialShareClasses,
    isStaff,
    init,
    submit,
    $reset
  }
})
