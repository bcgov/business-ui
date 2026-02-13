import { z } from 'zod'

export function getManageLiquidatorsSchema() {
  return z.object({
    parties: z.array(z.object({
      new: getPartySchema(RoleTypeUi.LIQUIDATOR),
      old: getPartySchema(RoleTypeUi.LIQUIDATOR).optional()
    })),
    courtOrder: getCourtOrderPoaSchema(),
    documentId: getDocumentIdSchema(),
    recordsOffice: getAddressSchema(),
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
    recordsOffice: getAddressSchema().default({
      deliveryAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      mailingAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      sameAs: false
    }),
    staffPayment: getStaffPaymentSchema().default({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }),
    activeParty: getActivePartySchema(RoleTypeUi.LIQUIDATOR)
  })
}

export type LiquidatorFormSchema = z.output<ReturnType<typeof getLiquidatorsSchema>>
