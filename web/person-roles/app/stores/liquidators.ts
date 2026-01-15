export const useLiquidatorStore = defineStore('liquidator-store', () => {
  const liquidatorSchema = getLiquidatorsSchema()
  const { tableState } = useManageParties()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { getCommonFilingPayloadData, initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<LiquidatorDraftState>({} as LiquidatorDraftState)
  const currentLiquidationOffice = shallowRef<UiBaseAddressObj | undefined>(undefined)
  const liquidateSubType = ref<LiquidateType>(LiquidateType.INTENT)
  const formState = reactive<LiquidatorFormSchema>(liquidatorSchema.parse({}))

  async function init(businessId: string, filingSubType?: LiquidateType, draftId?: string) {
    if (!filingSubType) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }

    initializing.value = true
    liquidateSubType.value = filingSubType
    $reset()

    const { draftFiling, parties, addresses } = await initFiling<ChangeOfLiquidators>(
      businessId,
      FilingType.CHANGE_OF_LIQUIDATORS,
      filingSubType,
      draftId,
      { roleType: RoleType.LIQUIDATOR },
      filingSubType === LiquidateType.ADDRESS
    )

    const draft = draftFiling?.filing?.changeOfLiquidators
    if (draft) {
      draftFilingState.value = draftFiling
      formState.staffPayment = formatStaffPaymentUi(draftFiling.filing.header)
      formState.courtOrder = formatCourtOrderUi(draft.courtOrder)
      formState.documentId.documentIdNumber = draft.documentId ?? ''
      formState.recordsOffice = formatBaseAddressUi(draft.offices?.liquidationRecordsOffice)
    }

    if (parties) {
      const draftRelationships = draft?.relationships
      tableState.value = draftRelationships
        ? getPartiesMergedWithRelationships(parties, draftRelationships)
        : parties
    }

    const office = addresses?.liquidationRecordsOffice
    if (office) {
      currentLiquidationOffice.value = { ...office }

      if (!draftId || !draft?.offices) {
        formState.recordsOffice = { ...office }
      }
    }

    await nextTick()
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const liquidatorPayload = formatLiquidatorsApi(
      tableState.value,
      formState,
      liquidateSubType.value,
      getCommonFilingPayloadData(formState.courtOrder, formState.documentId.documentIdNumber),
      currentLiquidationOffice.value
    )

    const payload = businessApi.createFilingPayload<ChangeOfLiquidators>(
      businessStore.business!,
      FilingType.CHANGE_OF_LIQUIDATORS,
      { changeOfLiquidators: liquidatorPayload },
      formatStaffPaymentApi(formState.staffPayment)
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling<ChangeOfLiquidators>(
        businessStore.businessIdentifier!,
        payload,
        isSubmission,
        draftId as string | number
      )
      draftFilingState.value = filingResp as unknown as LiquidatorDraftState
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, payload)
    }
  }

  function $reset() {
    const defaults = liquidatorSchema.parse({})
    Object.assign(formState, defaults)
    formState.activeParty = undefined
    currentLiquidationOffice.value = undefined
  }

  return {
    formState,
    initializing,
    liquidateSubType,
    draftFilingState,
    currentLiquidationOffice,
    init,
    submit,
    $reset
  }
})
