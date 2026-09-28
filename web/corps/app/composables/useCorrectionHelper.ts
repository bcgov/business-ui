enum CorrectionManagerKey {
  AMALGAMATION = 'manage-amalgamation',
  COURT_ORDER = 'manage-court-orders',
  CUSTODIAN = 'manage-custodians',
  DIRECTOR = 'manage-directors',
  LIQUIDATOR = 'manage-liquidators',
  NAME_TRANSLATION = 'manage-your-company-nt',
  OFFICES = 'manage-offices',
  RECEIVER = 'manage-receivers',
  SHARE_STRUCTURE = 'manage-share-structure',
  YOUR_COMPANY = 'manage-your-company'
}

export interface UseCorrectionHelperReturn {
  // State
  amalgamation: Ref<TableBusinessState<AmalgamationTableRow>[]>
  amalStmnt: Ref<TableBusinessState<AmalgamationCorrectStatementSchema>>
  courtOrders: Ref<TableBusinessState<CourtOrderPoaFullSchema>[]>
  directors: Ref<TableBusinessState<PartySchema>[]>
  receivers: Ref<TableBusinessState<PartySchema>[]>
  liquidators: Ref<TableBusinessState<PartySchema>[]>
  custodians: Ref<TableBusinessState<PartySchema>[]>
  offices: Ref<TableBusinessState<OfficesSchema>[]>
  shareClasses: Ref<TableBusinessState<ShareClassSchema>[]>
  resolutionDates: Ref<TableBusinessState<ResolutionDateSchema>[]>
  nameTranslations: Ref<TableBusinessState<NameTranslationSchema>[]>
  yourCompany: Ref<ManageYourCompanyState>

  // Change Flags
  hasDirectorChange: ComputedRef<boolean>
  hasReceiverChange: ComputedRef<boolean>
  hasLiquidatorChange: ComputedRef<boolean>
  hasCustodianChange: ComputedRef<boolean>
  hasOfficeChange: ComputedRef<boolean>
  hasShareStructureChange: ComputedRef<boolean>
  hasNameTranslationChange: ComputedRef<boolean>
  hasCourtOrderChange: ComputedRef<boolean>
  hasAmalgamationChange: ComputedRef<boolean>
  hasYourCompanyChange: ComputedRef<boolean>
  hasAnyChanges: ComputedRef<boolean>

  // Alerts/Task Guards
  hasActiveSubForm: ComputedRef<boolean>
  triggerActiveSubFormAlerts: () => boolean
  clearAllSubFormAlerts: () => void
}

export const useCorrectionHelper = (): UseCorrectionHelperReturn => {
  const store = useCorrectionStore()

  // Management Composables
  // Each composable corresponds to a section in the corrections filing
  // (Name Translations is inside the 'Your Company' section)
  const manageAmalgamation = useManageAmalgamation(CorrectionManagerKey.AMALGAMATION)
  const manageCourtOrders = useManageCourtOrders(CorrectionManagerKey.COURT_ORDER)
  const manageCustodians = useManageParties(CorrectionManagerKey.CUSTODIAN)
  const manageDirectors = useManageParties(CorrectionManagerKey.DIRECTOR)
  const manageLiquidators = useManageParties(CorrectionManagerKey.LIQUIDATOR)
  const manageNameTranslations = useManageNameTranslations(CorrectionManagerKey.NAME_TRANSLATION)
  const manageOffices = useManageOffices(CorrectionManagerKey.OFFICES)
  const manageReceivers = useManageParties(CorrectionManagerKey.RECEIVER)
  const manageShareStructure = useManageShareStructure(CorrectionManagerKey.SHARE_STRUCTURE)
  const manageYourCompany = useManageYourCompany(CorrectionManagerKey.YOUR_COMPANY)

  // Track State Changes
  const sectionChanges = [
    manageAmalgamation.hasChanges,
    manageCourtOrders.hasChanges,
    manageCustodians.hasChanges,
    manageDirectors.hasChanges,
    manageLiquidators.hasChanges,
    manageNameTranslations.hasChanges,
    manageOffices.hasChanges,
    manageReceivers.hasChanges,
    manageShareStructure.hasChanges,
    manageYourCompany.hasChanges
  ]

  const hasAnyChanges = computed(() =>
    sectionChanges.some(hasChange => toValue(hasChange))
    || !!store.formState.resolutionDate?.date?.trim()
  )

  // Alert and Task Guard Managers (track active sub forms)

  // array of object keys inside ManageYourCompany
  const fieldKeys = getActiveYourCompanySchema().unwrap().options.map(o => o.shape.key.value)

  const commonManagers = [
    useManageCommon({
      stateKey: CorrectionManagerKey.AMALGAMATION,
      activeSubjects: [
        { subject: () => store.formState.activeAmal, alertTarget: 'amalgamation-correct-form' },
        { subject: () => store.formState.activeAmalStmnt, alertTarget: 'amalgamation-correct-statement-form' }
      ]
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.COURT_ORDER,
      activeSubjects: { subject: () => store.formState.activeCourtOrder, alertTarget: 'court-order-poa-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.CUSTODIAN,
      activeSubjects: { subject: () => store.formState.activeCustodian, alertTarget: 'party-details-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.DIRECTOR,
      activeSubjects: { subject: () => store.formState.activeDirector, alertTarget: 'party-details-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.LIQUIDATOR,
      activeSubjects: { subject: () => store.formState.activeLiquidator, alertTarget: 'party-details-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.NAME_TRANSLATION,
      activeSubjects: { subject: () => store.formState.activeNameTranslation, alertTarget: 'name-translation-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.OFFICES,
      activeSubjects: { subject: () => store.formState.activeOffice, alertTarget: 'office-address-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.RECEIVER,
      activeSubjects: { subject: () => store.formState.activeReceiver, alertTarget: 'party-details-form' }
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.SHARE_STRUCTURE,
      activeSubjects: [
        { subject: () => store.formState.activeClass, alertTarget: 'share-class-form' },
        { subject: () => store.formState.activeSeries, alertTarget: 'share-series-form' },
        { subject: () => store.formState.activeResolutionDate, alertTarget: 'resolution-date-form' }
      ]
    }),
    useManageCommon({
      stateKey: CorrectionManagerKey.YOUR_COMPANY,
      activeSubjects: [
        ...fieldKeys.map(t => ({
          subject: () => store.formState.activeYourCompany,
          alertTarget: t
        })),
        {
          subject: () => store.formState.activeYourCompany,
          alertTarget: 'company-name-form'
        }
      ]
    })
  ]

  // returns true if any sub form is open
  const hasActiveSubForm = computed(() => commonManagers.some(m => m.hasActiveSubject.value))

  function triggerActiveSubFormAlerts(): boolean {
    if (!hasActiveSubForm.value) {
      return false
    }

    commonManagers.forEach((m) => {
      if (m.hasActiveSubject.value) {
        m.setActiveSubjectAlert()
      }
    })

    return true
  }

  function clearAllSubFormAlerts() {
    commonManagers.forEach(m => m.clearAllAlerts())
  }

  return {
    // Expose State
    amalgamation: manageAmalgamation.tableState,
    amalStmnt: manageAmalgamation.statementState,
    courtOrders: manageCourtOrders.tableState,
    directors: manageDirectors.tableState,
    receivers: manageReceivers.tableState,
    liquidators: manageLiquidators.tableState,
    custodians: manageCustodians.tableState,
    offices: manageOffices.tableState,
    shareClasses: manageShareStructure.shareClasses,
    resolutionDates: manageShareStructure.resolutionDates,
    nameTranslations: manageNameTranslations.tableState,
    yourCompany: manageYourCompany.state,

    // Track State Changes
    // Individual section change flags
    hasDirectorChange: manageDirectors.hasChanges,
    hasReceiverChange: manageReceivers.hasChanges,
    hasLiquidatorChange: manageLiquidators.hasChanges,
    hasCustodianChange: manageCustodians.hasChanges,
    hasOfficeChange: manageOffices.hasChanges,
    hasShareStructureChange: manageShareStructure.hasChanges,
    hasNameTranslationChange: manageNameTranslations.hasChanges,
    hasCourtOrderChange: manageCourtOrders.hasChanges,
    hasAmalgamationChange: manageAmalgamation.hasChanges,
    hasYourCompanyChange: manageYourCompany.hasChanges,
    // Global change flag
    hasAnyChanges,

    // Alerts/Task guards
    hasActiveSubForm,
    triggerActiveSubFormAlerts,
    clearAllSubFormAlerts
  }
}
