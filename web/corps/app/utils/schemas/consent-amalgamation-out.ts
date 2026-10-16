import { z } from 'zod'

function getConsentAmalgamationOutBaseSchema() {
  // FUTURE: jurisdiction (getForeignJurisdictionSchema) and the staff only court order
  // (getCourtOrderPoaSchema)
  return z.object({
    authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true })),
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' }))
  })
}

/**
 * The six-month consent to amalgamate out full form state.
 */
export function getConsentAmalgamationOutSchema(isStaff: boolean) {
  return withPaymentSection(getConsentAmalgamationOutBaseSchema(), isStaff)
}

export type ConsentAmalgamationOutFormSchema
  = WithPaymentSections<ReturnType<typeof getConsentAmalgamationOutBaseSchema>>
