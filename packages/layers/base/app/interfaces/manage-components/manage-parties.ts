import type { ManageBaseProps } from '#business/app/interfaces'

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
    roleType?: never
    partyFormProps?: never
    allowedActions?: never
  }
)
