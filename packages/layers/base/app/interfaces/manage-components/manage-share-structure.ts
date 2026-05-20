import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageShareStructureProps = Omit<ManageBaseProps, 'tableTitle'> & {
  labelOverrides?: TableLabelOverrides
  tableTitle?: string
} & (
  | {
    variant?: 'default' | 'correct'
    allowedActions?: ManageAllowedAction[]
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    allowedActions?: never
  }
)
