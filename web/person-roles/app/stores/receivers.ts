import { cloneDeep } from 'es-toolkit'

export const useReceiverStore = defineStore('receiver-store', () => {
  const receiverSchema = getReceiversSchema()
  const { tableState } = useManageParties()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { getCommonFilingPayloadData, initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const receiverSubType = ref<ReceiverType>(ReceiverType.APPOINT)
  const draftFilingState = shallowRef<ReceiverDraftState>({} as ReceiverDraftState)

  const formState = reactive<ReceiverFormSchema>(receiverSchema.parse({}))
  const initialFormState = shallowRef<ReceiverFormSchema>({} as ReceiverFormSchema)
  const initialReceivers = shallowRef<TableBusinessState<PartySchema>[]>([])

  async function init(businessId: string, filingSubType?: ReceiverType, draftId?: string) {
    if (!filingSubType) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }

    initializing.value = true
    receiverSubType.value = filingSubType
    $reset()

    const { draftFiling, parties } = await initFiling<ChangeOfReceivers>(
      businessId,
      FilingType.CHANGE_OF_RECEIVERS,
      filingSubType,
      draftId,
      { roleType: RoleType.RECEIVER }
    )

    const draft = draftFiling?.filing?.changeOfReceivers
    if (draft) {
      draftFilingState.value = draftFiling
      formState.staffPayment = formatStaffPaymentUi(draftFiling.filing.header)
      formState.courtOrder = formatCourtOrderUi(draft.courtOrder)
      formState.documentId.documentIdNumber = draft.documentId ?? ''
    }

    if (parties) {
      const draftRelationships = draft?.relationships
      tableState.value = draftRelationships
        ? getPartiesMergedWithRelationships(parties, draftRelationships)
        : parties
    }

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialReceivers.value = cloneDeep(tableState.value)
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const receiverPayload: ReceiverPayload = {
      type: receiverSubType.value,
      relationships: (
        tableState.value.map(relationship => formatRelationshipApi(relationship.new))
        // Only add relationships that have changes
      ).filter(relationship => relationship.actions?.length),
      ...getCommonFilingPayloadData(formState.courtOrder, formState.documentId.documentIdNumber)
    }

    const payload = businessApi.createFilingPayload<ChangeOfReceivers>(
      businessStore.business!,
      FilingType.CHANGE_OF_RECEIVERS,
      { changeOfReceivers: receiverPayload },
      formatStaffPaymentApi(formState.staffPayment)
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling<ChangeOfReceivers>(
        businessStore.businessIdentifier!,
        payload,
        isSubmission,
        draftId as string | number
      )
      draftFilingState.value = filingResp as unknown as ReceiverDraftState
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, payload)
    }
  }

  function $reset() {
    const defaults = receiverSchema.parse({})
    Object.assign(formState, defaults)
    formState.activeParty = undefined
    initialFormState.value = {
      ...defaults,
      activeParty: undefined
    }
    initialReceivers.value = []
  }

  return {
    formState,
    initializing,
    receivers: tableState,
    initialFormState,
    initialReceivers,
    init,
    submit,
    $reset
  }
})
