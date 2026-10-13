import { DateTime } from 'luxon'

/** A consent to continue out is valid for six months from its effective date. */
const CONSENT_VALID_MONTHS = 6

/** The API's UTC date-time format (see toApiDateTime), eg '2026-04-15T07:00:00+00:00'. */
const API_DATE_TIME_FORMAT = 'yyyy-MM-dd\'T\'HH:mm:ssZZ'

export const useContinuationOutStore = defineStore('continuation-out-store', () => {
  const { initFiling, createFilingPayload } = useFiling()

  const service = useBusinessService()
  const businessStore = useBusinessStore()
  const feeStore = useConnectFeeStore()
  const modal = useFilingModals()

  const { formState, initialFormState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(
    () => getContinuationOutSchema().parse({})
  )
  const draftFilingState = shallowRef<ContOutDraftState>({} as ContOutDraftState)
  const consentInfo = shallowRef<ContOutConsentInfo>({})

  /**
   * Fetch the consent to continue out this continuation out is filed against and stash its
   * validity window.
   *
   * The dashboard passes the consent filing id as `?consentFilingId`. A missing or unreadable
   * consent is tolerated - the backend only requires a COMPLETED consent to exist, it never
   * checks expiry.
   *
   * FUTURE: re-resolve the consent on draft resume (the query param is lost from
   * todo list links) and drive the expiry / date / jurisdiction mismatch UX from this window.
   */
  async function fetchConsentInfo(businessId: string) {
    const urlParams = useUrlSearchParams('history')
    const consentFilingId = urlParams.consentFilingId as string | undefined

    if (!consentFilingId) {
      return
    }

    try {
      const consent = await service.getFiling<CCOFiling>(businessId, consentFilingId)
      const validFrom = consent?.filing?.header?.effectiveDate
      const effectiveDate = DateTime.fromISO(validFrom ?? '', { zone: 'utc' })

      if (!effectiveDate.isValid) {
        return
      }

      consentInfo.value = {
        consentFilingId,
        validFrom,
        validTo: effectiveDate.plus({ months: CONSENT_VALID_MONTHS }).toFormat(API_DATE_TIME_FORMAT)
      }
    } catch (error) {
      console.warn('Unable to load the consent continuation out filing:', error)
    }
  }

  /**
   * Initialize the continuation out store.
   *
   * @param businessId - The business identifier (e.g. 'BC1230099')
   * @param draftId - The pre-created continuation out draft filing ID (from route param `filingId`)
   */
  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    // NB: initFiling enforces the staff only authorization (STAFF_FILINGS) - no extra gate needed
    const { draftFiling } = await initFiling<ContOutFiling>(
      businessId,
      FilingType.CONTINUATION_OUT,
      undefined,
      draftId
    )

    // UX for a missing/invalid filing id is handled by initFiling
    if (!draftFiling) {
      initializing.value = false
      return
    }

    // Coops and firms continue to file continuation outs in the legacy filings UI.
    if (businessStore.business && !businessStore.isBaseCompany()) {
      initializing.value = false
      await modal.openFilingNotAllowedErrorModal()
      return
    }

    draftFilingState.value = draftFiling
    const header = draftFiling.filing.header as ContOutDraftState['filing']['header']
    formState.documentDelivery.completingPartyEmail = header.documentOptionalEmail ?? ''
    // FUTURE: hydrate the continuation out date, the jurisdiction, the foreign business name, the
    // uploaded documents, the detail, the completing party name (header.certifiedBy) and the court order

    // the continuation out fee (COUTI) is always waived - staff only filing
    feeStore.updateAllFees(false, true) // (priority: false, waived: true)

    await fetchConsentInfo(businessId)

    await snapshotInitialState()
  }

  async function submit(isSubmission: boolean) {
    // FUTURE: continuationOutDate
    const contOutPayload: ContOutPayload = {}

    const headerPayload = {
      waiveFees: true,
      // authorization is only recorded on submission
      // FUTURE: the completing party confirmation drives this
      ...(isSubmission ? { authorizationReceived: true } : {}),
      ...(formState.documentDelivery.completingPartyEmail
        ? { documentOptionalEmail: formState.documentDelivery.completingPartyEmail }
        : {}
      )
    }

    // NB: certifiedBy is kept (createFilingPayload defaults it to the auth user's name)
    const filingPayload = createFilingPayload<ContOutFiling>(
      businessStore.business!,
      FilingType.CONTINUATION_OUT,
      { continuationOut: contOutPayload },
      // the header fields are all continuation out specific (not part of FilingHeaderSubmission)
      headerPayload as Record<string, unknown>
    )

    // The draft is always pre-created, so the existing filing is always updated (PUT)
    // NB: not saveOrSubmitFiling - the draft id is a route param here, never a '?draft' query param
    const filingResp = await service.saveOrUpdateDraftFiling<ContOutFiling>(
      businessStore.businessIdentifier!,
      filingPayload,
      isSubmission,
      draftFilingState.value.filing.header.filingId
    )
    draftFilingState.value = filingResp as unknown as ContOutDraftState

    return isSubmission
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as ContOutDraftState
    consentInfo.value = {}
  }

  return {
    consentInfo,
    draftFilingState,
    formState,
    initialFormState,
    initializing,
    init,
    submit,
    $reset
  }
})
