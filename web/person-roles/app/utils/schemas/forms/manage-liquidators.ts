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
    // recordsOffice: getAddressSchema().default({
    //   deliveryAddress: {
    //     street: '',
    //     streetAdditional: '',
    //     city: '',
    //     region: '',
    //     postalCode: '',
    //     country: 'CA',
    //     locationDescription: ''
    //   },
    //   mailingAddress: {
    //     street: '',
    //     streetAdditional: '',
    //     city: '',
    //     region: '',
    //     postalCode: '',
    //     country: 'CA',
    //     locationDescription: ''
    //   },
    //   sameAs: false
    // }),
    staffPayment: getStaffPaymentSchema().default({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }),
    activeParty: getActivePartySchema(RoleTypeUi.LIQUIDATOR),
    activeOffice: getActiveOfficesSchema()
  })
}

export type LiquidatorFormSchema = z.output<ReturnType<typeof getLiquidatorsSchema>>
