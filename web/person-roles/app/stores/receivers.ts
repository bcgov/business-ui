export const useReceiverStore = defineStore('receiver-store', () => {
  const receiverSchema = getReceiversSchema()
  const { tableState } = useManageParties()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { getCommonFilingPayloadData, initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false) // receiver store loading state
  const receiverSubType = ref<ReceiverType>(ReceiverType.APPOINT)
  const draftFilingState = shallowRef<FilingGetByIdResponse<{ changeOfReceivers: ReceiverPayload }>>(
    {} as FilingGetByIdResponse<{ changeOfReceivers: ReceiverPayload }>) // filing state saved as draft

  const formState = reactive<ReceiverFormSchema>(receiverSchema.parse({}))

  async function init(businessId: string, filingSubType?: ReceiverType, draftId?: string) {
    if (!filingSubType) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }
    initializing.value = true
    receiverSubType.value = filingSubType
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    const { draftFiling, parties, feeCode } = await initFiling<{ changeOfReceivers: ReceiverPayload }>(
      businessId,
      FilingType.CHANGE_OF_RECEIVERS,
      filingSubType,
      draftId,
      { roleType: RoleType.RECEIVER })

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value
      // TODO: util mappers for these - draft filing util?
      formState.staffPayment = formatStaffPaymentUi(draftFilingState.value.filing.header)
      if (draftFilingState.value.filing.changeOfReceivers.courtOrder) {
        formState.courtOrder = formatCourtOrderUi(draftFilingState.value.filing.changeOfReceivers.courtOrder)
      }
      if (draftFilingState.value.filing.changeOfReceivers.documentId) {
        formState.documentId.documentIdNumber = draftFilingState.value.filing.changeOfReceivers.documentId
      }
    }

    if (parties?.data) {
      const draftRelationships = draftFiling?.data.value?.filing.changeOfReceivers.relationships
      tableState.value = draftRelationships
        ? getPartiesMergedWithRelationships(parties.data, draftRelationships)
        : parties.data
    }
    initializing.value = false
    return feeCode
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

    const payload = businessApi.createFilingPayload<{ changeOfReceivers: ReceiverPayload }>(
      businessStore.business!,
      FilingType.CHANGE_OF_RECEIVERS,
      { changeOfReceivers: receiverPayload },
      formState.staffPayment
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling(
        businessStore.businessIdentifier!,
        payload,
        isSubmission,
        draftId as string | number
      )
      draftFilingState.value = filingResp as unknown as FilingGetByIdResponse<{ changeOfReceivers: ReceiverPayload }>
      // TODO: add draftId to url in case of refresh?
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, payload)
    }
  }

  function $reset() {
    const emptyObj = receiverSchema.parse({})
    formState.activeParty = undefined
    formState.courtOrder = emptyObj.courtOrder
    formState.staffPayment = emptyObj.staffPayment
  }

  return {
    formState,
    initializing,
    init,
    submit,
    $reset
  }
})
