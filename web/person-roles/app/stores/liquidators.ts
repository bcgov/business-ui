import { cloneDeep } from 'es-toolkit'

export const useLiquidatorStore = defineStore('liquidator-store', () => {
  const liquidatorSchema = getLiquidatorsSchema()
  const { tableState } = useManageParties()
  const { tableState: tableOffices } = useManageOffices()
  const { getPartiesMergedWithRelationships } = useBusinessParty()
  const { formatAddressTableState, formatDraftTableState } = useBusinessAddresses()
  const { getCommonFilingPayloadData, initFiling, createFilingPayload } = useFiling()

  const service = useBusinessService()
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
      filingSubType,
      draftId,
      { roleType: RoleType.LIQUIDATOR },
      officeParams
    )

    const draft = draftFiling?.filing?.changeOfLiquidators
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

    if (addresses) {
      const draftOffice = draft?.offices && formatAddressTableState(draft.offices, [OfficeType.LIQUIDATION])
      tableOffices.value = draftOffice
        ? formatDraftTableState(addresses, draftOffice)
        : addresses
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
      getCommonFilingPayloadData(formState.courtOrder, formState.documentId.documentIdNumber),
      tableOffices.value
    )

    const payload = createFilingPayload<ChangeOfLiquidators>(
      businessStore.business!,
      FilingType.CHANGE_OF_LIQUIDATORS,
      { changeOfLiquidators: liquidatorPayload },
      formatStaffPaymentApi(formState.staffPayment)
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    if (draftId || !isSubmission) {
      const filingResp = await service.saveOrUpdateDraftFiling<ChangeOfLiquidators>(
        businessStore.businessIdentifier!,
        payload,
        isSubmission,
        draftId as string | number
      )
      draftFilingState.value = filingResp as unknown as LiquidatorDraftState
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
    } else {
      await service.postFiling(businessStore.businessIdentifier!, payload)
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
