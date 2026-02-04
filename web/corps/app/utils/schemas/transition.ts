import { z } from 'zod'

function getClientTransitionSchema() {
  return z.object({
    certify: getCertifySchema().default({
      isCertified: false,
      legalName: ''
    }),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

function getStaffTransitionSchema() {
  return z.object({
    courtOrder: getCourtOrderPoaSchema().default(() => ({
      hasPoa: false,
      courtOrderNumber: ''
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

export function getTransitionSchema(isStaff: boolean) {
  const schema = z.object({
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' })),
    activeDirector: getActivePartySchema()
  // activeOffice: getActiveOfficesSchema() // TODO (only if allowing office edits)
  // activeShareClass: getActiveShareClassSchema() // TODO
  // activeShareSeries: getActiveShareSeriesSchema() // TODO
  })

  if (isStaff) {
    return schema.extend(getStaffTransitionSchema().shape)
  } else {
    return schema.extend(getClientTransitionSchema().shape)
  }
}

export type TransitionFormSchema = Partial<
  z.output<ReturnType<typeof getStaffTransitionSchema>>
  & z.output<ReturnType<typeof getClientTransitionSchema>>
  & z.output<ReturnType<typeof getTransitionSchema>>
>
