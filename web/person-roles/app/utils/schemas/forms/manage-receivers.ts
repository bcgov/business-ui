import { z } from 'zod'

export function getManageReceiversSchema() {
  return z.object({
    // TODO: update
    parties: z.array(z.object({
      new: getPartySchema(),
      old: getPartySchema().optional()
    })),
    courtOrder: getCourtOrderPoaSchema(),
    staffPayment: getStaffPaymentSchema()
  })
}

export type ManageReceiversSchema = z.output<ReturnType<typeof getManageReceiversSchema>>
