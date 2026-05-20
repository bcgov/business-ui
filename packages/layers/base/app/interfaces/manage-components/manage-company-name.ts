import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageCompanyNameProps = Omit<ManageBaseProps, 'tableTitle'> & {
  tableTitle?: string
  business?: BusinessData | BusinessDataPublic
  contact?: ContactPoint
  nameTranslationLabelOverrides?: TableLabelOverrides
} & (
  | {
    variant?: 'default' | 'correct'
    correctNameOptions: CorrectNameOption[]
    nrAllowedActionsTypes: NrRequestActionCode[]
    nameTranslationAllowedActions?: ManageAllowedAction[]
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    correctNameOptions?: never
    nrAllowedActionsTypes?: never
    nameTranslationAllowedActions?: never
  }
)

export interface ManageCompanyNameState {
  new: {
    legalName: string
    nrNumber?: string
    actions: ActionType[]
  }
  old: {
    legalName: string
    nrNumber?: string
    actions: ActionType[]
  }
}
