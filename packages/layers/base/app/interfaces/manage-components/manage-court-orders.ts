import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageCourtOrdersProps = ManageBaseProps & {
  labelOverrides?: TableLabelOverrides
} & (
  | {
    variant?: 'default' | 'correct'
    subject: string
    modelName?: string
    allowedActions?: ManageAllowedAction[]
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    subject?: never
    modelName?: never
    allowedActions?: never
  }
)
