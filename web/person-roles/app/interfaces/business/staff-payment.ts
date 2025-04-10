/** A filing's business object from the API. */
export interface StaffPayment {
  option: StaffPaymentOption
  routingSlipNumber: string
  bcolAccountNumber: string
  datNumber: string
  folioNumber: string
  isPriority: boolean
}
