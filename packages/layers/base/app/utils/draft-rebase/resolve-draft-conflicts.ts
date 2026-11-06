import { cloneDeep, omit } from 'es-toolkit'

type JsonRow = Record<string, unknown>
type ReportEntry = DraftChangeConflict | DraftChangeApplied | DraftChangeAbsorbed

interface ResolvedDraft<F extends FilingRecord> {
  draftFiling: FilingGetByIdResponse<F>
  staffModified: StaffModifiedKeys
  discardedEdits: DiscardedDraftEdit[]
}

/**
 * Changed-wins conflict resolution, run before the stores merge the draft.
 * - conflicts / alreadyApplied: draft row rewritten to current, badged, listed as a discarded edit
 * - absorbed (only staff changed the row): same rewrite + badge, nothing discarded
 * - untagged party rows dropped: a full roster carries base values the user never edited
 */
export function resolveDraftConflicts<F extends FilingRecord>(
  draftFiling: FilingGetByIdResponse<F>,
  filingName: FilingType,
  report: DraftChangesReport,
  current: DraftRebaseCurrentData = {}
): ResolvedDraft<F> {
  const staffModified: StaffModifiedKeys = {
    parties: [], offices: [], shareClasses: [], nameTranslations: [], resolutions: [], business: []
  }
  const discardedEdits: DiscardedDraftEdit[] = []
  const filing = cloneDeep(draftFiling.filing) as unknown as JsonRow
  const body = filing[filingName]
  if (body === null || typeof body !== 'object') {
    // Empty draft, nothing to resolve
    return { draftFiling, staffModified, discardedEdits }
  }
  const draftBody = body as JsonRow

  const entries: Array<{ entry: DraftChangeConflict | DraftChangeApplied, alreadyApplied: boolean }> = [
    ...report.conflicts.map(entry => ({ entry, alreadyApplied: false })),
    ...report.alreadyApplied.map(entry => ({ entry, alreadyApplied: true }))
  ]
  for (const { entry, alreadyApplied } of entries) {
    discardedEdits.push({
      section: entry.section,
      entityKey: entry.entityKey,
      draftValue: entry.draftValue,
      currentValue: 'currentValue' in entry ? entry.currentValue : undefined,
      alreadyApplied
    })
    applyEntry(draftBody, entry, current, filingName)
    recordStaffModified(entry, staffModified)
  }
  for (const entry of report.absorbed ?? []) {
    applyEntry(draftBody, entry, current, filingName)
    recordStaffModified(entry, staffModified)
  }

  if (report.upToDate !== true) {
    dropUntouchedParties(draftBody)
    if (current.shareClasses) {
      rekeyShareClasses(draftBody, current.shareClasses)
    }
  }

  return {
    draftFiling: { ...draftFiling, filing: filing as unknown as FilingGetByIdResponse<F>['filing'] },
    staffModified,
    discardedEdits
  }
}

/** Rewrites the draft's row for one report entry so the current value shows through after the store merge */
function applyEntry(body: JsonRow, entry: ReportEntry, current: DraftRebaseCurrentData, filingName: FilingType) {
  switch (entry.section) {
    case 'parties':
      resolveParty(body, entry)
      break
    case 'offices':
      resolveOffice(body, entry)
      break
    case 'shareClasses':
      resolveShareClass(body, entry, current.shareClasses)
      break
    case 'nameTranslations':
      resolveNameTranslation(body, entry)
      break
    case 'resolutions':
      resolveResolution(body, entry, current.resolutions)
      break
    case 'business':
      resolveBusinessField(body, entry, filingName)
      break
  }
}

/** Records the entity keys the staff badge matches on */
function recordStaffModified(entry: ReportEntry, staffModified: StaffModifiedKeys) {
  switch (entry.section) {
    case 'parties':
      if (entry.rowId !== null) {
        staffModified.parties.push(String(entry.rowId))
      }
      break
    case 'offices':
      staffModified.offices.push(entry.entityKey)
      break
    case 'shareClasses': {
      const key = getShareClassKey(entry.entityKey)
      if (key) {
        staffModified.shareClasses.push(key)
      }
      break
    }
    case 'nameTranslations':
      if (entry.rowId !== null) {
        staffModified.nameTranslations.push(String(entry.rowId))
      }
      staffModified.nameTranslations.push(stripEntityKeySuffix(entry.entityKey).toUpperCase())
      break
    case 'resolutions':
      staffModified.resolutions.push(getResolutionEntityKey(entry.entityKey))
      break
    case 'business':
      staffModified.business.push(entry.entityKey)
      break
  }
}

/** The draft key carrying each business field edit, per filing type (mirrors legal-api BUSINESS_FIELD_PATHS) */
const BUSINESS_FIELD_PATHS: Partial<Record<FilingType, Record<string, string[]>>> = {
  [FilingType.CORRECTION]: { legalName: ['nameRequest'] },
  [FilingType.ALTERATION]: { legalName: ['nameRequest'], legalType: ['business', 'legalType'] }
}

/** Drops the draft's edit to a business field - the stores read the business itself from the current record */
function resolveBusinessField(body: JsonRow, entry: ReportEntry, filingName: FilingType) {
  const path = BUSINESS_FIELD_PATHS[filingName]?.[entry.entityKey]
  if (!path) {
    return
  }
  const [key, nested] = path.length === 1 ? [path[0]!, undefined] : [path[1]!, path[0]!]
  if (!nested) {
    if (key === 'nameRequest') {
      delete body.nameRequest
    }
    return
  }
  const parent = body[nested]
  if (parent !== null && typeof parent === 'object') {
    body[nested] = omit(parent as JsonRow, [key])
  }
}

/** The draft's own row when the entry carries one (conflicts / alreadyApplied) */
function draftValueOf(entry: ReportEntry): JsonRow | null {
  return 'draftValue' in entry ? entry.draftValue : null
}

function matchesPartyEntry(row: JsonRow, entry: ReportEntry): boolean {
  const draftValue = draftValueOf(entry)
  if (draftValue) {
    const draftId = getPartyRowId(draftValue)
    if (draftId !== undefined) {
      return getPartyRowId(row) === draftId
    }
    const nameKey = getPartyNameKey(draftValue)
    return nameKey !== undefined && getPartyNameKey(row) === nameKey
  }
  // no draft row: pair by current id, else entity name
  // - id-less draft row = new party, never name-paired to an id'd entry
  const rowId = getPartyRowId(row)
  if (entry.rowId !== null) {
    return rowId === String(entry.rowId)
  }
  return getPartyNameKey(row) === stripEntityKeySuffix(entry.entityKey)
}

/** The completing party is form data the report never names - a shared name must not drop it */
function isCompletingPartyRow(row: JsonRow): boolean {
  const roles = Array.isArray(row.roles) ? row.roles : []
  return roles.some(role => asJsonRow(role).roleType === RoleType.COMPLETING_PARTY)
}

/** Drops the draft's row - every store merges party drafts over the current rows by id */
function resolveParty(body: JsonRow, entry: ReportEntry) {
  if (Array.isArray(body.relationships)) {
    body.relationships = body.relationships.filter((row) => {
      const party = asJsonRow(row)
      return isCompletingPartyRow(party) || !matchesPartyEntry(party, entry)
    })
  }
}

/** Drops untagged rows - the stores merge every draft row over the current party, stale base values included */
function dropUntouchedParties(body: JsonRow) {
  if (!Array.isArray(body.relationships)) {
    return
  }
  body.relationships = body.relationships.filter((row) => {
    const party = asJsonRow(row)
    return isCompletingPartyRow(party) || (Array.isArray(party.actions) && party.actions.length > 0)
  })
}

/** Drops the office type - the offices section merges per type over the current offices */
function resolveOffice(body: JsonRow, entry: ReportEntry) {
  const offices = body.offices
  if (offices !== null && typeof offices === 'object' && entry.entityKey in offices) {
    const kept = omit(offices as JsonRow, [entry.entityKey])
    if (Object.keys(kept).length) {
      body.offices = kept
    } else {
      delete body.offices
    }
  }
}

/** Substitutes the current class - a class missing from the (full) draft section reads as removed */
function resolveShareClass(body: JsonRow, entry: ReportEntry, currentClasses?: ShareClass[]) {
  // whole-class granularity: a staff series edit substitutes the class (decision 11)
  const key = getShareClassKey(entry.entityKey)
  if (!key) {
    return
  }
  const shareStructure = body.shareStructure
  const rows = asJsonRow(shareStructure).shareClasses
  if (Array.isArray(rows)) {
    const kept = rows.filter(row => getShareClassKey(asJsonRow(row).name) !== key)
    const currentClass = currentClasses?.find(shareClass => getShareClassKey(shareClass.name) === key)
    if (currentClass) {
      kept.push(cloneDeep(currentClass))
    }
    setFullSection(body, 'shareClasses', kept)
  }
}

/** Substitutes the current resolution - the resolution dates section is a full replacement too */
function resolveResolution(body: JsonRow, entry: ReportEntry, currentResolutions?: Resolution[]) {
  const key = getResolutionEntityKey(entry.entityKey)
  const rows = asJsonRow(body.shareStructure).resolutionDates
  if (Array.isArray(rows)) {
    const kept = rows.filter(row => getResolutionRowKey(row) !== key)
    const currentResolution = currentResolutions?.find(
      resolution => getResolutionKey(resolution.date, resolution.type) === key
    )
    if (currentResolution) {
      kept.push({ id: currentResolution.id, type: currentResolution.type, date: currentResolution.date })
    }
    setFullSection(body, 'resolutionDates', kept)
  }
}

/** Writes a shareStructure list back, dropping the key (and an emptied shareStructure) rather than sending [] */
function setFullSection(body: JsonRow, key: 'shareClasses' | 'resolutionDates', rows: unknown[]) {
  const shareStructure = asJsonRow(body.shareStructure)
  if (rows.length) {
    shareStructure[key] = rows
    return
  }
  const kept = omit(shareStructure, [key])
  if (Object.keys(kept).length) {
    body.shareStructure = kept
  } else {
    delete body.shareStructure
  }
}

function matchesNameTranslationEntry(row: JsonRow, entry: ReportEntry): boolean {
  const draftValue = draftValueOf(entry)
  const draftId = draftValue ? getNameTranslationId(draftValue) : undefined
  if (draftId !== undefined) {
    return getNameTranslationId(row) === draftId
  }
  const rowId = getNameTranslationId(row)
  if (entry.rowId !== null && rowId !== undefined) {
    return rowId === String(entry.rowId)
  }
  const nameKey = draftValue ? getNameTranslationNameKey(draftValue) : stripEntityKeySuffix(entry.entityKey)
  return nameKey !== undefined && getNameTranslationNameKey(row) === nameKey
}

/** Substitutes the current translation - the section is a full list, a row left out is deleted by the filer */
function resolveNameTranslation(body: JsonRow, entry: ReportEntry) {
  const rows = body.nameTranslations
  if (Array.isArray(rows)) {
    const kept = rows.filter(row => !matchesNameTranslationEntry(asJsonRow(row), entry))
    const replacement = currentNameTranslation(entry, rows)
    if (replacement) {
      kept.push(replacement)
    }
    if (kept.length) {
      body.nameTranslations = kept
    } else {
      delete body.nameTranslations
    }
  }
}

/**
 * The row that replaces the draft's translation.
 * - conflict / absorbed: the current row (none when staff removed it)
 * - alreadyApplied: the draft's row keyed to the current id, so the merge pairs it instead of adding a twin
 */
function currentNameTranslation(entry: ReportEntry, rows: unknown[]): JsonRow | undefined {
  // the report's rowId is a number; alias ids are strings everywhere else and the merge pairs with ===
  const rowId = (id: unknown) => (id === null || id === undefined ? undefined : String(id))
  if ('currentValue' in entry) {
    return entry.currentValue
      ? { id: rowId(entry.rowId ?? entry.currentValue.id), name: entry.currentValue.name }
      : undefined
  }
  const draftRow = rows.map(asJsonRow).find(row => matchesNameTranslationEntry(row, entry))
  return draftRow && { ...draftRow, id: rowId(entry.rowId ?? draftRow.id) }
}

/** Points draft classes (and their series) whose ids no longer exist at the current rows of the same name */
function rekeyShareClasses(body: JsonRow, currentClasses: ShareClass[]) {
  const rows = asJsonRow(body.shareStructure).shareClasses
  if (!Array.isArray(rows)) {
    return
  }
  const currentIds = new Set(currentClasses.map(shareClass => String(shareClass.id)))
  for (const row of rows.map(asJsonRow)) {
    if (row.id === null || row.id === undefined || currentIds.has(String(row.id))) {
      // Is a new row or the id persisted
      continue
    }
    // Row was replaced, needs to be rekeyed (try to match on the name)
    const classKey = getShareClassKey(row.name)
    const currentClass = currentClasses.find(shareClass => getShareClassKey(shareClass.name) === classKey)
    if (!currentClass) {
      continue
    }
    row.id = currentClass.id
    const series = Array.isArray(row.series) ? row.series.map(asJsonRow) : []
    for (const draftSeries of series) {
      const seriesKey = getShareClassKey(draftSeries.name)
      const currentSeries = currentClass.series?.find(item => getShareClassKey(item.name) === seriesKey)
      if (currentSeries) {
        draftSeries.id = currentSeries.id
      }
    }
  }
}
