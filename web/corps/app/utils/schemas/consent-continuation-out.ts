import { z } from 'zod'

function getConsentContinuationOutBaseSchema() {
  // FUTURE: jurisdiction (getForeignJurisdictionSchema), the completing party confirmation
  // (getConfirmCompletingPartySchema - owns certifiedBy + authorizationReceived) and the staff only
  // detail (getDetailSchema(1900)) and court order (getCourtOrderPoaSchema)
  return z.object({
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' }))
  })
}

/**
 * The six-month consent to continue out full form state.
 */
export function getConsentContinuationOutSchema(isStaff: boolean) {
  return withPaymentSection(getConsentContinuationOutBaseSchema(), isStaff)
}

export type ConsentContinuationOutFormSchema
  = WithPaymentSections<ReturnType<typeof getConsentContinuationOutBaseSchema>>
