export type AddressFormFieldName = keyof UiAddress

/** Options the office / party sub forms pass through to their FormAddress. */
export interface AddressFormProps {
  /** the delivery address street cannot be a PO Box */
  noPoBox?: boolean
  /** drops the 'same as mailing' checkbox so the delivery inputs always show */
  hideSameAs?: boolean
  /** inputs to render disabled, per address (e.g. to lock everything but the fields a record is missing) */
  disabledFields?: {
    mailingAddress?: AddressFormFieldName[]
    deliveryAddress?: AddressFormFieldName[]
  }
}
