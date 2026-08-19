import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageCourtOrdersProps = ManageBaseProps & {
  labelOverrides?: TableLabelOverrides
} & (
  | {
    variant?: 'default' | 'correct'
    modelName?: string
    allowedActions?: ManageAllowedAction[]
    addDefaultValues?: Partial<CourtOrderPoaFullSchema>
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    modelName?: never
    allowedActions?: never
    addDefaultValues?: never
  }
)
