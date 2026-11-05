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
    /** passed through to the office sub form's FormAddress (validateOnOpen only applies to existing offices) */
    addressFormProps?: AddressFormProps
    preventActions?: boolean
    actionPreventedSignal?: number
  }
  | {
    variant: 'readonly' | 'correct-readonly'
    subject?: never
    modelName?: never
    allowedActions?: never
    allowAddOfficeType?: never
    addressFormProps?: never
    preventActions?: never
    actionPreventedSignal?: never
  }
)
