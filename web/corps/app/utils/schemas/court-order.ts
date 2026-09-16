import { z } from 'zod'

export function getCourtOrderFormSchema() {
  return z.object({
    // NB: the base layer filing variant enforces 'court order number required' and
    // 'court order text OR one court order file required' (legal-api cross field rules)
    // NB: 'filingId' defaults to the base schema placeholder and is replaced on init with the
    // pre-created draft filing id from the route
    courtOrder: getCourtOrderFilingSchema().default(() => ({
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
