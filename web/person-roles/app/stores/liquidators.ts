import { cloneDeep } from 'es-toolkit'

export const useLiquidatorStore = defineStore('liquidator-store', () => {
  const liquidatorSchema = getLiquidatorsSchema()
  const { tableState } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const { initFiling, formatFilingPayloadApi, saveOrSubmitFiling } = useFiling()

  const businessStore = useBusinessStore()

  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<LiquidatorDraftState>({} as LiquidatorDraftState)
  const liquidateSubType = ref<LiquidateType>(LiquidateType.INTENT)
  const formState = reactive<LiquidatorFormSchema>(liquidatorSchema.parse({}))
  const initialFormState = shallowRef<LiquidatorFormSchema>({} as LiquidatorFormSchema)
  const initialLiquidators = shallowRef<TableBusinessState<PartySchema>[]>([])
  const initialOffices = shallowRef<TableBusinessState<OfficesSchema>[]>([])

  async function init(businessId: string, filingSubType?: LiquidateType, draftId?: string) {
    if (!filingSubType) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }

    initializing.value = true
    liquidateSubType.value = filingSubType
    $reset()

    // only fetch liquidation records office if an appoint, change address, intent or liq report filing
    const officeParams = [
      LiquidateType.ADDRESS,
      LiquidateType.APPOINT,
      LiquidateType.REPORT,
      LiquidateType.INTENT
    ].includes(filingSubType)
      ? [OfficeType.LIQUIDATION]
      : undefined

    const { draftFiling, parties, addresses } = await initFiling<ChangeOfLiquidators>(
      businessId,
      FilingType.CHANGE_OF_LIQUIDATORS,
      { filingSubType, draftId, parties: { roleType: RoleType.LIQUIDATOR }, offices: officeParams }
    )

    const draft = draftFiling?.filing?.changeOfLiquidators
    if (draft) {
      draftFilingState.value = draftFiling
      formState.staffPayment = formatStaffPaymentUi(draftFiling.filing.header)
      formState.courtOrder = formatCourtOrderUi(draft.courtOrder)
    }

    if (parties) {
      tableState.value = parties
    }

    if (addresses) {
      tableOffices.value = addresses
    }

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initialLiquidators.value = cloneDeep(tableState.value)
    initialOffices.value = cloneDeep(tableOffices.value)
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const liquidatorPayload = formatLiquidatorsApi(
      tableState.value,
      liquidateSubType.value,
      formatCommonFilingDataApi(formState.courtOrder),
      tableOffices.value
    )

    const payload = formatFilingPayloadApi<ChangeOfLiquidators>(
      businessStore.business!,
      FilingType.CHANGE_OF_LIQUIDATORS,
      { changeOfLiquidators: liquidatorPayload },
      formatStaffPaymentApi(formState.staffPayment)
    )

    const filingResp = await saveOrSubmitFiling<ChangeOfLiquidators>(businessStore.businessIdentifier!, payload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
    if (filingResp) {
      draftFilingState.value = filingResp as unknown as LiquidatorDraftState
    }
  }

  function $reset() {
    const defaults = liquidatorSchema.parse({})
    Object.assign(formState, defaults)
    formState.activeParty = undefined
    formState.activeOffice = undefined
    initialFormState.value = cloneDeep(formState)
  }

  return {
    formState,
    initializing,
    liquidateSubType,
    draftFilingState,
    initialFormState,
    initialLiquidators,
    initialOffices,
    liquidators: tableState,
    offices: tableOffices,
    init,
    submit,
    $reset
  }
})
