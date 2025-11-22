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

export function getReceiversSchema() {
  return z.object({
    courtOrder: getCourtOrderPoaSchema().default({
      hasPoa: false,
      courtOrderNumber: ''
    }),
    staffPayment: getStaffPaymentSchema().default({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }),
    activeParty: getActivePartySchema()
  })
}

export type ReceiverFormSchema = z.output<ReturnType<typeof getReceiversSchema>>
