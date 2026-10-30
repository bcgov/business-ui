import type { ManageBaseProps } from '#business/app/interfaces'

interface PartyFormProps {
  hideRemove?: boolean
  // render the edit form inline in the row (no "Changing {subject}" header or card border), as the
  // director change does; the default is the standard card
  inlineEdit?: boolean
  // show a Reset button that restores the party to the values it had when the edit was opened
  showReset?: boolean
  // Done before Cancel (the default is Cancel then Done)
  doneFirst?: boolean
  partyNameProps?: {
    allowBusinessName?: boolean
    allowPreferredName?: boolean
    requireNameChangeConfirmation?: boolean
    requireFirstName?: boolean
    // target of the spelling-mistake hint link; defaults to the form 47 register correction form
    correctionFormUrl?: string
    // keep the "Legal Name" legend for screen readers only
    hideLabel?: boolean
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
  // former name shows for NAME_CHANGED parties in every party table; pass false to opt out
  showFormerName?: boolean
  // dropdown entries that each open the edit form for a subset of actions (e.g. address only); when set,
  // existing rows get one entry per option instead of the single "Change" entry
  editOptions?: TableEditOption[]
  // which row action is the main button: 'edit' (default) or 'remove' (e.g. Cease for directors)
  primaryAction?: TablePrimaryAction
  // per-column display options (e.g. an ISO appointment date without "to current")
  columnOptions?: TablePartyColumnOptions
  // render the "Add {subject}" button alone above the table instead of the heading bar
  // (ignored while the ceased tab shows, which needs the bar for its tabs)
  hideTableHeading?: boolean
} & (
  | {
    variant?: 'default' | 'correct'
    subject: string
    modelName?: string
    roleType?: RoleTypeUi
    partyFormProps?: PartyFormProps
    allowedActions?: ManageAllowedAction[]
    preventActions?: boolean
    actionPreventedSignal?: number
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    subject?: never
    modelName?: never
    roleType?: RoleTypeUi
    partyFormProps?: never
    allowedActions?: never
    preventActions?: never
    actionPreventedSignal?: never
  }
)
