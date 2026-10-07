import type { ManageBaseProps } from '#business/app/interfaces'

interface PartyFormProps {
  hideRemove?: boolean
  partyNameProps?: {
    allowBusinessName?: boolean
    allowPreferredName?: boolean
    requireNameChangeConfirmation?: boolean
  }
  partyRoleProps?: {
    allowedRoles: RoleTypeUi[]
    roleClass?: RoleClass
  }
  // limits on the party's effective (start) and cessation (end) dates, e.g. a director can't be
  // appointed before founding - the cessation date is always also bounded by the effective date
  effectiveDateBounds?: DateBounds
  cessationDateBounds?: DateBounds
}

export type ManagePartiesProps = ManageBaseProps & {
  columnsToDisplay?: TablePartyColumnName[]
  labelOverrides?: TableLabelOverrides
} & (
  | {
    variant?: 'default' | 'correct'
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
    roleType?: RoleTypeUi
    partyFormProps?: never
    allowedActions?: never
  }
)
