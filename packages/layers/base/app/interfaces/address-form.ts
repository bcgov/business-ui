export type AddressFormFieldName = keyof UiAddress

/** Options for FormAddress - the office / party sub forms and the Manage components pass them through. */
export interface AddressFormProps {
  /** true = both addresses must be in BC, Canada; 'delivery' = the delivery address only (mailing may be anywhere) */
  bcCanadaOnly?: boolean | 'delivery'
  /** show the validation errors as soon as the form opens (e.g. to point out the fields a record is missing) */
  validateOnOpen?: boolean
  /** the delivery address street cannot be a PO Box */
  noPoBox?: boolean
  /** drops the 'same as mailing' checkbox so the delivery inputs always show - the model's sameAs must be false */
  hideSameAs?: boolean
  /** inputs to render disabled, per address - their errors are not raised since the user cannot fix them */
  disabledFields?: {
    mailingAddress?: AddressFormFieldName[]
    deliveryAddress?: AddressFormFieldName[]
  }
}
