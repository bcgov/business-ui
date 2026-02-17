import { cloneDeep } from 'es-toolkit'

export const useTransitionStore = defineStore('transition-store', () => {
  const { tableState: tableParties } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const { tableState: tableShareClasses } = useManageShareStructure()
  const { getBusinessAddresses } = useBusinessAddresses()
  // const { getPartiesMergedWithRelationships } = useBusinessParty()
  const {
    // getCommonFilingPayloadData,
    initFiling
  } = useFiling()

  // const businessApi = useBusinessApi()
  // const businessStore = useBusinessStore()

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

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialDirectors.value = cloneDeep(tableParties.value)
    // initialOffices.value = cloneDeep(tableOffices.value)
    initializing.value = false
  }

  // TODO: implement submit
  // async function submit(isSubmission: boolean) {
  //   const receiverPayload: ReceiverPayload = {
  //     type: receiverSubType.value,
  //     relationships: (
  //       tableState.value.map(relationship => formatRelationshipApi(relationship.new))
  //       // Only add relationships that have changes
  //     ).filter(relationship => relationship.actions?.length),
  //     ...getCommonFilingPayloadData(formState.courtOrder, formState.documentId.documentIdNumber)
  //   }

  //   const payload = businessApi.createFilingPayload<ChangeOfReceivers>(
  //     businessStore.business!,
  //     FilingType.CHANGE_OF_RECEIVERS,
  //     { changeOfReceivers: receiverPayload },
  //     formatStaffPaymentApi(formState.staffPayment)
  //   )

  //   const draftId = draftFilingState.value?.filing?.header?.filingId
  //   if (draftId || !isSubmission) {
  //     const filingResp = await businessApi.saveOrUpdateDraftFiling<ChangeOfReceivers>(
  //       businessStore.businessIdentifier!,
  //       payload,
  //       isSubmission,
  //       draftId as string | number
  //     )
  //     draftFilingState.value = filingResp as unknown as ReceiverDraftState
  //     const urlParams = useUrlSearchParams()
  //     urlParams.draft = String(filingResp.filing.header.filingId)
  //   } else {
  //     await businessApi.postFiling(businessStore.businessIdentifier!, payload)
  //   }
  // }

  function $reset() {
    const defaults = getTransitionSchema(isStaff.value).parse({})
    Object.assign(formState, defaults)
    formState.activeDirector = undefined
    formState.activeClass = undefined
    formState.activeSeries = undefined

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
    // submit,
    $reset
  }
})
