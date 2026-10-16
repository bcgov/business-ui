import type { ManageBaseProps } from '#business/app/interfaces'

export interface ManageYourCompanyFieldState<T> {
  value: T
  actions: ActionType[]
}

export interface ManageYourCompanyFields {
  // Current business legal type
  legalType: ManageYourCompanyFieldState<CorpTypeCd | undefined>

  // Continuation In - Legal Name in previous jurisdiction
  namePreviousJurisdiction?: ManageYourCompanyFieldState<string | undefined>

  // Continuation Out or Amalgamation Out - Legal Name in new jurisdiction
  nameNewJurisdiction?: ManageYourCompanyFieldState<string | undefined>

  // Continuation In - Extra-Provincial Identifier assigned to business in BC
  numberExpro?: ManageYourCompanyFieldState<string | undefined>

  // Continuation In - Identifier in previous jurisdiction
  numberPreviousJurisdiction?: ManageYourCompanyFieldState<string | undefined>

  // Continuation Out or Amalgamation Out - Date of "Out" (YYYY-MM-DD)
  outDate?: ManageYourCompanyFieldState<string | undefined>

  // Continuation In - Jurisdiction before "continuing in" (country/region)
  previousJurisdiction?: ManageYourCompanyFieldState<{ country: string, region: string | null } | undefined>

  // Continuation Out or Amalgamation Out - Jurisdiction after "out" (country/region)
  newJurisdiction?: ManageYourCompanyFieldState<{ country: string, region: string | null } | undefined>

  // Name Request Data
  nameRequest?: ManageYourCompanyFieldState<NameRequestSchema | undefined>
}

export interface ManageYourCompanyState {
  new: ManageYourCompanyFields
  old: ManageYourCompanyFields
}

type FieldDisplayMode = 'default' | 'hide' | 'readonly'

export type YourCompanyFieldOverrides = {
  nameNewJurisdiction?: FieldDisplayMode
  namePreviousJurisdiction?: FieldDisplayMode
  numberExpro?: FieldDisplayMode
  numberPreviousJurisdiction?: FieldDisplayMode
  outDate?: FieldDisplayMode
  jurisdiction?: FieldDisplayMode
  previousJurisdiction?: FieldDisplayMode
  newJurisdiction?: FieldDisplayMode
  nameRequest?: FieldDisplayMode
  legalType?: FieldDisplayMode
  nameTranslations?: FieldDisplayMode
  foundingDate?: FieldDisplayMode
  contactInfo?: FieldDisplayMode
}

export type ManageYourCompanyProps = Omit<ManageBaseProps, 'tableTitle'> & {
  tableTitle?: string
  business?: BusinessData | BusinessDataPublic
  contact?: ContactPoint
  labelOverrides?: TableLabelOverrides
  correctedFilingType?: FilingType
  nameTranslationLabelOverrides?: TableLabelOverrides
  variant?: 'default' | 'correct' | 'readonly' | 'correct-readonly'
  fieldOverrides?: YourCompanyFieldOverrides
} & (
  | {
    variant?: 'default' | 'correct'
    correctNameOptions: CorrectNameOption[]
    nrAllowedActionsTypes: NrRequestActionCode[]
    nameTranslationAllowedActions?: ManageAllowedAction[]
    preventActions?: boolean
    actionPreventedSignal?: number
    nested?: boolean
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    correctNameOptions?: never
    nrAllowedActionsTypes?: never
    nameTranslationAllowedActions?: never
    preventActions?: never
    actionPreventedSignal?: never
    nested?: never
  }
)
