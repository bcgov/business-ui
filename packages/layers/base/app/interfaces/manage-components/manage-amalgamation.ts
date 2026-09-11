import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageAmalgamationProps = ManageBaseProps & {
  labelOverrides?: TableLabelOverrides
} & (
  | {
    variant?: 'default' | 'correct'
    modelName?: string
    allowedActions?: ManageAllowedAction[]
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    modelName?: never
    allowedActions?: never
  }
)
