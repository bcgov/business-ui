import { isEqual } from 'es-toolkit'

export const useLiquidatorStore = defineStore('liquidator-store', () => {
  const liquidatorSchema = getLiquidatorsSchema()
  const { tableState } = useManageParties()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { getCommonFilingPayloadData, initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<LiquidatorDraftState>({} as LiquidatorDraftState)
  const currentLiquidationOffice = shallowRef<LiquidationRecordsOffice>(undefined)
  const liquidateSubType = ref<LiquidateType>(LiquidateType.INTENT)
  const formState = reactive<LiquidatorFormSchema>(liquidatorSchema.parse({}))

  async function init(businessId: string, filingSubType?: LiquidateType, draftId?: string) {
    if (!filingSubType) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }
    initializing.value = true
    liquidateSubType.value = filingSubType
    // reset any previous state (ex: user switches accounts) and init loading state
    // $reset()
    const { draftFiling, parties, addresses } = await initFiling<ChangeOfLiquidators>(
      businessId,
      FilingType.CHANGE_OF_LIQUIDATORS,
      filingSubType,
      draftId,
      { roleType: RoleType.LIQUIDATOR },
      filingSubType === LiquidateType.ADDRESS
    )

    if (draftFiling?.data.value?.filing) {
      draftFilingState.value = draftFiling.data.value
      const filingData = draftFilingState.value.filing

      Object.assign(formState.staffPayment, formatStaffPaymentUi(filingData.header))

      if (filingData.changeOfLiquidators.courtOrder) {
        formState.courtOrder = formatCourtOrderUi(filingData.changeOfLiquidators.courtOrder)
      }
      if (filingData.changeOfLiquidators.documentId) {
        formState.documentId.documentIdNumber = filingData.changeOfLiquidators.documentId
      }

      const mailingAddress = filingData.changeOfLiquidators.offices?.liquidationRecordsOffice.mailingAddress
      const deliveryAddress = filingData.changeOfLiquidators.offices?.liquidationRecordsOffice.deliveryAddress

      formState.recordsOffice = {
        mailingAddress: formatAddressUi(mailingAddress),
        deliveryAddress: formatAddressUi(deliveryAddress),
        sameAs: isEqual(mailingAddress, deliveryAddress)
      }
    }
    if (parties?.data) {
      const draftRelationships = draftFiling?.data.value?.filing.changeOfLiquidators.relationships
      tableState.value = draftRelationships
        ? getPartiesMergedWithRelationships(parties.data, draftRelationships)
        : parties.data
    }

    const office = addresses?.data?.liquidationRecordsOffice
    if (office) {
      currentLiquidationOffice.value = { ...office }

      if (!draftId || !draftFilingState.value.filing.changeOfLiquidators.offices) {
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
