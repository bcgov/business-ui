import { cloneDeep } from 'es-toolkit'

// the only value legal-api accepts for a court order 'effect of order'
const EFFECT_OF_ORDER_POA = 'planOfArrangement'

export const useCourtOrderStore = defineStore('court-order-store', () => {
  const schema = getCourtOrderFormSchema()
  const { initFiling, createFilingPayload } = useFiling()

  const service = useBusinessService()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const modal = useFilingModals()

  const formState = reactive(schema.parse({}))
  const initialFormState = shallowRef<CourtOrderFormSchema>({} as CourtOrderFormSchema)
  const initializing = ref<boolean>(false)
  const draftFilingState = shallowRef<CourtOrderDraftState>({} as CourtOrderDraftState)

  const isStaff = useIsStaff()

  /**
   * Initialize the court order store.
   *
   * A court order draft is pre-created by the business dashboard before navigating to this page.
   *
   * Note: useFilingPageWatcher calls init(businessId, draftId) when there is no filingSubType,
   * so draftId must be the second parameter (matching the InitFiling type).
   *
   * @param businessId - The business identifier (e.g. 'BC1230099')
   * @param draftId - The pre-created court order draft filing ID (from route param `filingId`)
   */
  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    const { draftFiling } = await initFiling<CourtOrderFiling>(
      businessId,
      FilingType.COURT_ORDER,
      undefined,
      draftId
    )

    // a missing/invalid filing id (or a filing that isn't a court order draft) is handled by
    // initFiling - it opens the get draft filing error modal and returns no draft filing
    if (!draftFiling) {
      initializing.value = false
      return
    }

    // Coops and firms continue to file court orders in the legacy filings UI.
    // NB: legal-api allows CP/SP/GP for this filing so this restriction only exists in the UI.
    if (businessStore.business && !businessStore.isBaseCompany()) {
      initializing.value = false
      await modal.openFilingNotAllowedErrorModal()
      return
    }

    // The draft is always expected to exist (pre-created before page load)
    draftFilingState.value = draftFiling
    // NB: hydrate with the non-refined variant - a draft may be saved with incomplete data
    formState.courtOrder = getCourtOrderPoaFullSchema().parse({
      ...draftFiling.filing.courtOrder,
      filingType: FilingType.COURT_ORDER,
      filingId: draftFiling.filing.header.filingId
    })
    formState.staffPayment = formatStaffPaymentUi(draftFiling.filing.header)
    // sync the fee widget with the resumed staff payment selection
    feeStore.updateAllFees(
      !!formState.staffPayment.isPriority,
      formState.staffPayment.option === StaffPaymentOption.NO_FEE
    )

    await nextTick()
    initialFormState.value = cloneDeep(formState)
    initializing.value = false
  }

  async function submit(isSubmission: boolean) {
    const courtOrder = formState.courtOrder

    // only successfully uploaded (and not removed) documents are submitted
    const files: CourtOrderDocPayload[] = (courtOrder.files ?? [])
      .filter(file => file.action !== CourtOrderFileAction.DELETED
        && file.status !== CourtOrderFileStatus.ERROR
        && !!file.fileKey)
      .map(file => ({
        fileName: file.name,
        fileKey: file.fileKey!,
        documentType: file.type
      }))

    const courtOrderPayload: CourtOrderFilingPayload = {
      fileNumber: courtOrder.fileNumber,
      ...(courtOrder.effectOfOrder ? { effectOfOrder: EFFECT_OF_ORDER_POA } : {}),
      ...(courtOrder.orderDetails?.trim() ? { orderDetails: courtOrder.orderDetails.trim() } : {}),
      ...(files.length ? { files } : {})
    }

    // NB: never send header.effectiveDate - it would make the filing future effective
    const filingPayload = createFilingPayload<CourtOrderFiling>(
      businessStore.business!,
      FilingType.COURT_ORDER,
      { courtOrder: courtOrderPayload },
      formatStaffPaymentApi(formState.staffPayment)
    )

    // The draft is always pre-created, so the existing filing is always updated (PUT) -
    // a court order filing is never created from this page
    const filingResp = await service.saveOrUpdateDraftFiling<CourtOrderFiling>(
      businessStore.businessIdentifier!,
      filingPayload,
      isSubmission,
      draftFilingState.value.filing.header.filingId
    )
    draftFilingState.value = filingResp as unknown as CourtOrderDraftState

    return isSubmission
  }

  function $reset() {
    const emptyObj = schema.parse({})
    Object.assign(formState, emptyObj)
    initialFormState.value = emptyObj
    draftFilingState.value = {} as CourtOrderDraftState
  }

  return {
    formState,
    initializing,
    isStaff,
    initialFormState,
    init,
    submit,
    $reset
  }
})
