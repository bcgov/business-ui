/** What `useFiling().initFiling` should load and merge for a filing page */
export interface InitFilingOptions {
  filingSubType?: string
  draftId?: string
  /** fetch (and merge the draft's `relationships` over) the business parties */
  parties?: { roleClass?: RoleClass, roleType?: RoleType, all?: boolean, date?: string }
  /** fetch (and merge the draft's `offices` over) these office types */
  offices?: OfficeType[]
  /** false = the offices are read-only in this filing, show current and ignore the draft's copy */
  mergeDraftOffices?: boolean
  /** fetch (and merge the draft's `shareStructure.shareClasses` over) the share classes */
  shareClasses?: boolean
  /** fetch (and merge the draft's `nameTranslations` over) the name translations */
  nameTranslations?: boolean
  /** fetch (and merge the draft's `shareStructure.resolutionDates` over) the resolutions */
  resolutions?: boolean
}

/** The draft keys the common merge reads; filing-specific keys stay on the store's own type */
export interface DraftSections {
  relationships?: BusinessRelationship[]
  offices?: ApiEntityOfficeAddress
  shareStructure?: { shareClasses?: ShareClass[], resolutionDates?: Resolution[] }
  nameTranslations?: NameTranslation[]
}

export interface InitFilingResult<T extends FilingRecord> {
  draftFiling: FilingGetByIdResponse<T> | undefined
  /** `draftFiling.filing[filingName]` after conflict resolution, for filing-specific hydration */
  draftBody: (DraftSections & Record<string, unknown>) | undefined
  parties: TableBusinessState<PartySchema>[] | undefined
  addresses: TableBusinessState<OfficesSchema>[] | undefined
  shareClasses: TableBusinessState<ShareClassSchema>[] | undefined
  nameTranslations: TableBusinessState<NameTranslationSchema>[] | undefined
  resolutions: { newState: ResolutionDateSchema, tableState: TableBusinessState<ResolutionDateSchema>[] } | undefined
}
