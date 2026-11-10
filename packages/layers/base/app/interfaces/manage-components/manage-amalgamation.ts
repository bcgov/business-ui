import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageAmalgamationProps = ManageBaseProps & {
  labelOverrides?: TableLabelOverrides
} & (
  | {
    variant?: 'default' | 'correct'
    modelName?: string
    statementModelName?: string
    allowedActions?: ManageAllowedAction[]
    preventActions?: boolean
    actionPreventedSignal?: number
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    modelName?: never
    statementModelName?: never
    allowedActions?: never
    preventActions?: never
    actionPreventedSignal?: never
  }
)
