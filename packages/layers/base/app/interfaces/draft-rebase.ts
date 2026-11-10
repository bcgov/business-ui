/** The snapshot sections legal-api's draft changes report diffs */
export type DraftChangesSection
  = 'parties' | 'offices' | 'shareClasses' | 'nameTranslations' | 'resolutions' | 'business'

export interface DraftInterveningFiling {
  filingId: number
  name: FilingType
  filingSubType: string | null
  displayName: string
  effectiveDate: string | null
  filedByStaff: boolean
}

export interface DraftBusinessChange {
  baseValue: string | null
  currentValue: string | null
}

/** An entity both an intervening filing and the draft changed - the current (staff) value wins */
export interface DraftChangeConflict {
  section: DraftChangesSection
  entityKey: string
  /** the current row id when the entity still exists (parties / name translations only) */
  rowId: number | null
  /** the paths the intervening filings changed on the entity */
  paths: string[]
  baseValue: Record<string, unknown> | null
  currentValue: Record<string, unknown> | null
  /** the draft's own row, null when the draft removed the entity */
  draftValue: Record<string, unknown> | null
}

/** An entity the draft changed the same way an intervening filing already did */
export interface DraftChangeApplied {
  section: DraftChangesSection
  entityKey: string
  rowId: number | null
  draftValue: Record<string, unknown> | null
}

/** An entity only the intervening filings changed - the draft never touched it, so its row must follow current */
export interface DraftChangeAbsorbed {
  section: DraftChangesSection
  entityKey: string
  rowId: number | null
  /** the current row, null when an intervening filing removed the entity */
  currentValue: Record<string, unknown> | null
}

/** GET businesses/{identifier}/filings/{draftId}/changes */
export interface DraftChangesReport {
  baseTransactionId: number | null
  currentTransactionId: number | null
  /** false = a filing completed after the draft's base, null = the base is unknown (pre-anchor draft) */
  upToDate: boolean | null
  interveningFilings: DraftInterveningFiling[]
  businessChanges: Partial<Record<'legalName' | 'legalType' | 'state', DraftBusinessChange | null>>
  changedSections: DraftChangesSection[]
  draftSections: DraftChangesSection[]
  conflicts: DraftChangeConflict[]
  alreadyApplied: DraftChangeApplied[]
  absorbed: DraftChangeAbsorbed[]
  staleIds: { parties: number[], nameTranslations: number[], resolutions: number[] }
}

/** Current data substituted into the draft's full-replacement sections during conflict resolution */
export interface DraftRebaseCurrentData {
  shareClasses?: ShareClass[]
  resolutions?: Resolution[]
}

/** Per section, the row keys (see getStaffModifiedRowKeys) whose current value came from a staff filing */
export type StaffModifiedKeys = Record<DraftChangesSection, string[]>

/** A draft edit the resolution discarded, kept for the resume notice */
export interface DiscardedDraftEdit {
  section: DraftChangesSection
  entityKey: string
  draftValue: Record<string, unknown> | null
  currentValue?: Record<string, unknown> | null
  /** true = the draft's edit matched the intervening change, nothing was lost */
  alreadyApplied: boolean
}
