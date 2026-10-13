const PACIFIC_TZ = 'America/Vancouver'

export const useAnnualReportStore = defineStore('annual-report-store', () => {
  const {
    createFilingPayload,
    getPaymentHeaderApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()
  const urlParams = useUrlSearchParams()

  const isStaff = useIsStaff()

  const draftFilingState = shallowRef<CoopARDraftState>({} as CoopARDraftState)
  // the AR year the dashboard todo opened this filing for ('?year=', or the draft header on resume)
  const arYear = ref<number>(getYearFromUrl())
  const directors = shallowRef<TableBusinessState<PartySchema>[]>([])
  const offices = shallowRef<TableBusinessState<OfficesSchema>[]>([])

  const {
    formState,
    initialFormState,
    initializing,
    snapshotInitialState,
    resetFormState
  } = useFilingFormState<CoopAnnualReportSchema>(
    () => getCoopAnnualReportSchema(isStaff.value).parse({}) as CoopAnnualReportSchema
  )

  /**
   * The date the annual report is filed as of - also the effective date of the whole bundle and the
   * date directors/addresses are fetched for.
   * FUTURE: Replace the fallback with the AGM date when one is entered.
   */
  const asOfDate = computed<IsoDatePacific>(() => `${arYear.value}-12-31`)

  function getYearFromUrl(): number {
    const currentYear = Number(getToday(PACIFIC_TZ).slice(0, 4))
    return Number(urlParams.year) || currentYear
  }

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    // reset any previous state (ex: user switches accounts) and init loading state
    $reset()

    const { draftFiling, parties, addresses } = await initFiling<CoopARFiling>(
      businessId,
      FilingType.ANNUAL_REPORT,
      undefined,
      draftId,
      { roleType: RoleType.DIRECTOR },
      [OfficeType.REGISTERED]
    )

    directors.value = parties ?? []
    offices.value = addresses ?? []

    if (draftFiling?.filing?.annualReport) {
      draftFilingState.value = draftFiling as CoopARDraftState
      const draftHeader = draftFilingState.value.filing.header
      if (draftHeader.ARFilingYear) {
        arYear.value = draftHeader.ARFilingYear
      }
      // re-syncs the fee widget with a resumed staff payment selection
      hydratePaymentState(draftHeader, formState)
    }

    await snapshotInitialState()
  }

  async function submit(isSubmission: boolean) {
    const annualReportPayload: CoopARPayload = {
      annualReportDate: asOfDate.value,
      // FUTURE: set the AGM date (or the 'did not hold an AGM' declaration)
      // and 'as of' director/office data (used by report generation)
      annualGeneralMeetingDate: null,
      didNotHoldAgm: false
    }

    // the AR min/max dates are only on the full business data (never the slim/public variant)
    const business = businessStore.business as BusinessData
    const effectiveDate = toApiDateTime(asOfDate.value)

    const filingPayload = createFilingPayload<CoopARFiling>(
      business,
      FilingType.ANNUAL_REPORT,
      { annualReport: annualReportPayload },
      {
        ARFilingYear: arYear.value,
        // the bundled change of directors validates against the header effective date
        ...(effectiveDate ? { effectiveDate } : {}),
        // round-tripped for the dashboard AR todo when resuming a draft
        ...(business.arMinDate ? { arMinDate: business.arMinDate } : {}),
        ...(business.arMaxDate ? { arMaxDate: business.arMaxDate } : {}),
        // FUTURE: the certify section - until then createFilingPayload defaults it to the signed in user's name
        ...getPaymentHeaderApi(formState, isStaff.value)
      } as Partial<FilingHeaderSubmission>
    )

    const filingResp = await saveOrSubmitFiling<CoopARFiling>(
      businessStore.businessIdentifier!,
      filingPayload,
      { isSubmission, draftId: draftFilingState.value?.filing?.header?.filingId }
    )
    if (filingResp) {
      draftFilingState.value = filingResp as CoopARDraftState
    }
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as CoopARDraftState
    directors.value = []
    offices.value = []
    arYear.value = getYearFromUrl()
  }

  return {
    arYear,
    asOfDate,
    directors,
    formState,
    initializing,
    initialFormState,
    isStaff,
    offices,
    init,
    submit,
    $reset
  }
})
