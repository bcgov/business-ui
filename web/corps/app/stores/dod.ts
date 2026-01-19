import { DateTime } from 'luxon'

// TODO - FUTURE - maybe consolidate 'delay' store with other dissolution filings if possible
export const useDodStore = defineStore('delay-of-dissolution-store', () => {
  const { currentAccount } = storeToRefs(useConnectAccountStore())
  const schema = getDodSchema()
  const { getCommonFilingPayloadData, initFiling } = useFiling()

  const businessApi = useBusinessApi()
  const businessStore = useBusinessStore()

  const formState = reactive(schema.parse({}))
  const initializing = ref<boolean>(false)
  const dissolutionSubType = ref<DissolutionType>(DissolutionType.DELAY)
  const draftFilingState = shallowRef<FilingGetByIdResponse<{ dissolution: DissolutionPayload }>>(
    {} as FilingGetByIdResponse<{ dissolution: DissolutionPayload }>)

  const isStaff = computed(() => currentAccount.value.accountType === AccountType.STAFF)

  // set zone may return null if timezone is invalid, we know America/Vancouver is valid
  const inSixMonths = DateTime.now().setZone('America/Vancouver').plus({ months: 6 }).toISODate()!
  watch(() => formState.delay.option, (val) => {
    if (val === DelayOption.DEFAULT) {
      formState.delay.date = inSixMonths
    }
  }, { immediate: true })

  async function init(businessId: string, filingSubType?: DissolutionType, draftId?: string) {
    // FUTURE: if consolidating with other dissolution types update below condition
    if (!filingSubType || filingSubType !== DissolutionType.DELAY) {
      await useFilingModals().openInitFilingErrorModal({ status: 500 })
      return
    }
    initializing.value = true
    dissolutionSubType.value = filingSubType
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()
    const { draftFiling } = await initFiling<{ dissolution: DissolutionPayload }>(
      businessId,
      FilingType.DISSOLUTION,
      filingSubType,
      draftId
    )

    if (draftFiling?.filing) {
      draftFilingState.value = draftFiling
      // delay
      formState.delay.option = draftFilingState.value.filing.dissolution.delayType!
      if (draftFilingState.value.filing.dissolution.dissolutionDate) {
        formState.delay.date = draftFilingState.value.filing.dissolution.dissolutionDate
      }
      // court order - staff only
      if (draftFilingState.value.filing.dissolution.courtOrder && isStaff.value) {
        formState.courtOrder = formatCourtOrderUi(draftFilingState.value.filing.dissolution.courtOrder)
      }
      // folio number
      if (draftFilingState.value.filing.header.folioNumber) {
        formState.folio.folioNumber = draftFilingState.value.filing.header.folioNumber
      }
      // add to ledger - staff only
      if (isStaff.value) {
        formState.addToLedger = draftFilingState.value.displayLedger
      }
    }
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const dissolutionPayload: DissolutionPayload = {
      dissolutionType: dissolutionSubType.value,
      delayType: formState.delay.option,
      ...getCommonFilingPayloadData(formState.courtOrder),
      ...(formState.delay.option === DelayOption.CUSTOM
        ? { dissolutionDate: formState.delay.date }
        : {}
      )
    }

    const payload = businessApi.createFilingPayload<{ dissolution: DissolutionPayload }>(
      businessStore.business!,
      FilingType.DISSOLUTION,
      { dissolution: dissolutionPayload },
      {
        folioNumber: formState.folio.folioNumber,
        ...(!isStaff.value ? { certifiedBy: formState.certify.legalName } : {})
      }
    )

    const draftId = draftFilingState.value?.filing?.header?.filingId
    const headers = { 'hide-in-ledger': String(!formState.addToLedger && isStaff.value) }
    // const headers = {}
    if (draftId || !isSubmission) {
      const filingResp = await businessApi.saveOrUpdateDraftFiling<{ dissolution: DissolutionPayload }>(
        businessStore.businessIdentifier!,
        payload,
        isSubmission,
        draftId as string | number,
        headers
      )
      draftFilingState.value = filingResp as unknown as FilingGetByIdResponse<{ dissolution: DissolutionPayload }>
      const urlParams = useUrlSearchParams()
      urlParams.draft = String(filingResp.filing.header.filingId)
    } else {
      await businessApi.postFiling(businessStore.businessIdentifier!, payload, headers)
    }
    return isSubmission
  }

  function $reset() {
    const emptyObj = schema.parse({})
    Object.assign(formState, emptyObj)
  }

  return {
    formState,
    initializing,
    isStaff,
    init,
    submit,
    $reset
  }
})
