import { z } from 'zod'

export function getCourtOrderFormSchema() {
  return z.object({
    // NB: 'isFileAndDetailsRequired' requires the court order number, the order details and one court order file
    // NB: 'filingId' defaults to the base schema placeholder and is replaced on init with the
    // pre-created draft filing id from the route
    courtOrder: getCourtOrderPoaFullSchema({ isFileAndDetailsRequired: true }).default(() => ({
      ...getCourtOrderPoaFullSchema().parse({}),
      filingType: FilingType.COURT_ORDER
    })),
    staffPayment: getStaffPaymentSchema().default(() => ({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }))
  })
}

export type CourtOrderFormSchema = z.output<ReturnType<typeof getCourtOrderFormSchema>>
