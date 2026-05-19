// consistent props for Manage{Something} components

// export interface ManageBaseProps {
// }

export interface ManageTableProps {
  tableTitle: string
  emptyText?: string
  sectionTitle?: string
  sectionDescription?: string
  stateKey?: string
  loading?: boolean
}

interface PartyFormProps {
  hideRemove?: boolean
  partyNameProps?: {
    allowBusinessName?: boolean
    allowPreferredName?: boolean
  }
  partyRoleProps?: {
    allowedRoles: RoleTypeUi[]
    roleClass?: RoleClass
  }
}

export type ManagePartiesProps = ManageTableProps & {
  columnsToDisplay?: TablePartyColumnName[]
  labelOverrides?: TableLabelOverrides
} & (
  | {
    variant: 'default' | 'correct'
    subject: string
    modelName?: string
    roleType?: RoleTypeUi
    partyFormProps?: PartyFormProps
    allowedActions?: ManageAllowedAction[]
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    subject?: never
    modelName?: never
    roleType?: never
    partyFormProps?: never
    allowedActions?: never
  }
)

// export interface ManageOfficesProps extends ManageBaseProps {
//   tableTitle: string
//   subject?: string
//   allowAddOfficeType?: OfficeType
// }

// export interface ManageOfficesProps extends ManageBaseProps {
//   tableTitle: string
//   subject?: string
//   allowAddOfficeType?: OfficeType
// }

// type ManageCompanyNameProps = {
//   stateKey?: string
//   business?: BusinessData | BusinessDataPublic
//   contact?: ContactPoint
//   loading?: boolean
//   variant?: ManageVariant
//   // name translation section (shown when addNameTranslationLabel is provided)
//   nameTranslationAllowedActions?: ManageAllowedAction[]
//   nameTranslationLabelOverrides?: TableLabelOverrides
// } & (
//   | {
//     readonly: false
//     correctNameOptions: CorrectNameOption[]
//     nrAllowedActionsTypes: NrRequestActionCode[]
//   }
//   | {
//     readonly?: true
//     correctNameOptions?: CorrectNameOption[]
//     nrAllowedActionsTypes?: NrRequestActionCode[]
//   }
// )
