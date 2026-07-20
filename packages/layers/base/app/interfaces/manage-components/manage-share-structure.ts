import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageShareStructureProps = Omit<ManageBaseProps, 'tableTitle'> & {
  labelOverrides?: TableLabelOverrides
  tableTitle?: string
  preventActions?: boolean
  actionPreventedSignal?: number
} & (
  | {
    variant?: 'default' | 'correct'
    allowedActions?: ManageAllowedAction[]
    collectResolutionDate?: boolean
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    allowedActions?: never
    collectResolutionDate?: never
  }
)
