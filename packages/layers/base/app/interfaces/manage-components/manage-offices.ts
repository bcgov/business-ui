import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageOfficesProps = ManageBaseProps & {
  labelOverrides?: TableLabelOverrides
  /** hides the office sub form's Remove button (always hidden for the correct variant) */
  hideRemove?: boolean
} & (
  | {
    variant?: 'default' | 'correct'
    subject: string
    modelName?: string
    allowedActions?: ManageAllowedAction[]
    allowAddOfficeType?: OfficeType
    /** true = both office addresses must be in BC, Canada; 'delivery' = the delivery address only */
    bcCanadaOnly?: boolean | 'delivery'
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    subject?: never
    modelName?: never
    allowedActions?: never
    allowAddOfficeType?: never
    bcCanadaOnly?: never
  }
)
