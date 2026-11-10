/**
 * Resumes a draft against the business as it is now.
 * - source: legal-api's changes report (GET .../filings/{draftId}/changes)
 * - state: the report, the badge keys, the discarded edits, the base to send on save
 */
export const useDraftRebase = () => {
  const service = useBusinessService()

  const report = useState<DraftChangesReport | undefined>('draft-rebase-report', () => undefined)
  const staffModified = useState<StaffModifiedKeys>('draft-rebase-staff-modified', emptyStaffModifiedKeys)
  const discardedEdits = useState<DiscardedDraftEdit[]>('draft-rebase-discarded-edits', () => [])
  /** The watermark the loaded form reflects - sent on save so the draft's base advances */
  const baseTransactionId = useState<number | undefined>('draft-rebase-base-transaction-id', () => undefined)
  /** A save hit 409: the form no longer reflects the business and the base must not be sent again */
  const staleOnSave = useState<boolean>('draft-rebase-stale-on-save', () => false)

  /**
   * The draft with its conflicts resolved against the changes report.
   * - report unavailable (error / 404): the draft as saved, no base recorded
   */
  async function resolveDraftFiling<F extends FilingRecord>(
    businessId: string,
    draftId: string | number,
    draftFiling: FilingGetByIdResponse<F>,
    filingName: FilingType,
    current: DraftRebaseCurrentData = {}
  ): Promise<FilingGetByIdResponse<F>> {
    $reset()
    try {
      const changes = await service.getFilingChanges(businessId, draftId)
      const currentData = { ...current }
      if (!currentData.resolutions && hasSection(changes, 'resolutions')) {
        currentData.resolutions = await service.getResolutions(businessId, false, true)
      }

      const resolved = changes.upToDate === true
        ? { draftFiling, staffModified: emptyStaffModifiedKeys(), discardedEdits: [] }
        : resolveDraftConflicts(draftFiling, filingName, changes, currentData)

      report.value = changes
      staffModified.value = resolved.staffModified
      discardedEdits.value = resolved.discardedEdits
      // an unknown base ran no diff - a save must not stamp the draft as rebased to the watermark
      baseTransactionId.value = changes.upToDate === null ? undefined : (changes.currentTransactionId ?? undefined)
      return resolved.draftFiling
    } catch (error) {
      // the report is advisory - resume the draft as saved when it is unavailable
      console.warn('Draft rebase skipped:', error)
      $reset()
      return draftFiling
    }
  }

  /** Tags the rows of a merged table whose current value came from a staff filing */
  function markStaffModified<R extends TableBusinessState<unknown>[] | undefined>(
    rows: R,
    section: DraftChangesSection
  ): R {
    const keys = staffModified.value[section]
    if (!rows || !keys.length) {
      return rows
    }
    for (const row of rows) {
      if (getStaffModifiedRowKeys(row.new, section).some(key => keys.includes(key))) {
        row.modifiedByStaff = true
      }
    }
    return rows
  }

  /** Flags the your-company fields whose current value came from a staff filing (old and new, so undo keeps it) */
  function markStaffModifiedBusiness(state: ManageYourCompanyState): ManageYourCompanyState {
    const fieldByKey: Record<string, keyof ManageYourCompanyFields> = {
      legalName: 'nameRequest',
      legalType: 'legalType'
    }
    for (const key of staffModified.value.business) {
      const field = fieldByKey[key]
      for (const side of [state.old, state.new]) {
        if (field && side[field]) {
          side[field].modifiedByStaff = true
        }
      }
    }
    return state
  }

  /**
   * The base to send with a save.
   * - not rebased: undefined
   * - stale base on a draft save: undefined (the work is kept)
   * - stale base on a submission: still sent, so the API keeps answering 409
   */
  function getSaveOptions(isSubmission = false): { baseTransactionId: number } | undefined {
    if (baseTransactionId.value === undefined || (staleOnSave.value && !isSubmission)) {
      return undefined
    }
    return { baseTransactionId: baseTransactionId.value }
  }

  function markStaleOnSave() {
    staleOnSave.value = true
  }

  function $reset() {
    report.value = undefined
    staffModified.value = emptyStaffModifiedKeys()
    discardedEdits.value = []
    baseTransactionId.value = undefined
    staleOnSave.value = false
  }

  return {
    report,
    staffModified,
    discardedEdits,
    baseTransactionId,
    staleOnSave,
    resolveDraftFiling,
    markStaffModified,
    markStaffModifiedBusiness,
    getSaveOptions,
    markStaleOnSave,
    $reset
  }
}

function emptyStaffModifiedKeys(): StaffModifiedKeys {
  return { parties: [], offices: [], shareClasses: [], nameTranslations: [], resolutions: [], business: [] }
}

function hasSection(report: DraftChangesReport, section: DraftChangesSection): boolean {
  return [...report.conflicts, ...report.alreadyApplied, ...report.absorbed]
    .some(entry => entry.section === section)
}
