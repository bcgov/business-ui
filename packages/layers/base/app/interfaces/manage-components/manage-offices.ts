import type { ManageBaseProps } from '#business/app/interfaces'

export type ManageOfficesProps = ManageBaseProps & {
  labelOverrides?: TableLabelOverrides
  /**
   * hides Remove on the office sub form (always hidden for the correct variant) and in the table row actions,
   * including an added row, so an office the filing seeded and requires cannot be dropped
   */
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
