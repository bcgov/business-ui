const PACIFIC_TZ = 'UTC-7'

export const useAnnualReportStore = defineStore('annual-report-store', () => {
  const {
    formatFilingPayloadApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()

  const businessStore = useBusinessStore()

  const isStaff = useIsStaff()

  const draftFilingState = shallowRef<CoopARDraftState>({} as CoopARDraftState)
  // the year the AR is filed for - the business' next unfiled year, or the draft header on resume
  const arYear = ref<number>(getCurrentPacificYear())
  // the AR date of a resumed draft - round tripped verbatim so a draft is never silently re-dated
  const draftArDate = ref<IsoDatePacific | undefined>(undefined)
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
   * date directors/addresses are fetched for. A resumed draft keeps its own date.
   * FUTURE: Replace the derived date with the AGM date when one is entered.
   * FUTURE: May need to refetch the directors/addresses when it changes.
   */
  const asOfDate = computed<IsoDatePacific>(() =>
    draftArDate.value
    ?? (arYear.value < getCurrentPacificYear() ? `${arYear.value}-12-31` : getToday(PACIFIC_TZ))
  )

  /**
   * The AR cannot be filed outside the business' filing window - a draft saved with a stale date
   * (or one that has since aged out) has to be resolved by staff.
   */
  const isArDateInvalid = computed<boolean>(() => {
    // the AR min/max dates are only on the full business data (never the slim/public variant)
    const business = businessStore.business as BusinessData | undefined
    if (!business?.arMinDate || !business?.arMaxDate) {
      return false
    }
    return asOfDate.value < business.arMinDate || asOfDate.value > business.arMaxDate
  })

  function getCurrentPacificYear(): number {
    return Number(getToday(PACIFIC_TZ).slice(0, 4))
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
      const draftFilingBody = draftFilingState.value.filing
      // a resumed draft keeps its own year and date, even when they are outside the filing window
      draftArDate.value = draftFilingBody.annualReport.annualReportDate
      // re-syncs the fee widget with a resumed staff payment selection
      hydratePaymentState(draftFilingBody.header, formState)
    }

    // a new filing is for the business' next unfiled year (arMinDate is a past year when overdue)
    const business = businessStore.business as BusinessData | undefined
    const businessArYear = Number(business?.arMinDate?.slice(0, 4)) || getCurrentPacificYear()
    arYear.value = draftFilingState.value?.filing?.header?.ARFilingYear ?? businessArYear

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

    const filingPayload = formatFilingPayloadApi<CoopARFiling>(
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
        // FUTURE: the certify section - until then formatFilingPayloadApi defaults it to the signed in user's name
        ...formatPaymentHeaderApi(formState, isStaff.value)
      } as Partial<FilingHeaderSubmission>
    )

    // FUTURE: submissions are disabled until the filing form is completed
    if (isSubmission) {
      logBlockedSubmission(filingPayload)
      return
    }

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
    draftArDate.value = undefined
    directors.value = []
    offices.value = []
    arYear.value = getCurrentPacificYear()
  }

  return {
    arYear,
    asOfDate,
    directors,
    draftArDate,
    formState,
    initializing,
    initialFormState,
    isArDateInvalid,
    isStaff,
    offices,
    init,
    submit,
    $reset
  }
})
