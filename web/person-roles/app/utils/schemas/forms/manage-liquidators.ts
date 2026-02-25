import { z } from 'zod'

export function getLiquidatorsSchema() {
  return z.object({
    courtOrder: getCourtOrderPoaSchema().default({
      hasPoa: false,
      courtOrderNumber: ''
    }),
    documentId: getDocumentIdSchema().default({
      documentIdNumber: ''
    }),
    certify: getCertifySchema().default({
      isCertified: false,
      legalName: ''
    }),
    folio: getFolioSchema().default({ folioNumber: '' }),
    staffPayment: getStaffPaymentSchema().default({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }),
    activeParty: getActivePartySchema(RoleTypeUi.LIQUIDATOR),
    activeOffice: getActiveOfficesSchema(),
    confirmOffices: z.boolean().default(false),
    confirmParties: z.boolean().default(false)
  })
}

export type LiquidatorFormSchema = z.output<ReturnType<typeof getLiquidatorsSchema>>
