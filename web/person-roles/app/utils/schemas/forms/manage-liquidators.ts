import { z } from 'zod'

export function getManageLiquidatorsSchema() {
  return z.object({
    // TODO: update
    parties: z.array(z.object({
      new: getPartySchema(),
      old: getPartySchema().optional()
    })),
    courtOrder: getCourtOrderPoaSchema(),
    documentId: getDocumentIdSchema(),
    staffPayment: getStaffPaymentSchema()
  })
}

export type ManageLiquidatorsSchema = z.output<ReturnType<typeof getManageLiquidatorsSchema>>

export function getLiquidatorsSchema() {
  return z.object({
    courtOrder: getCourtOrderPoaSchema().default({
      hasPoa: false,
      courtOrderNumber: ''
    }),
    documentId: getDocumentIdSchema().default({
      documentIdNumber: ''
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

export type LiquidatorFormSchema = z.output<ReturnType<typeof getLiquidatorsSchema>>
