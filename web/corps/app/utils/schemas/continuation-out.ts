import { z } from 'zod'

/**
 * The continuation out full form state.
 *
 * Staff only - there is no client variant: no folio number section, no staff payment fieldset
 * (the COUTI fee is always waived).
 */
export function getContinuationOutSchema() {
  // FUTURE: the continuation out date (getDateSchema with a max of today - FormEffectiveDate),
  // the foreign jurisdiction (getForeignJurisdictionSchema), the business name in the new
  // jurisdiction, the uploaded documents (>= 1 required), the detail (getDetailSchema(1900)),
  // the completing party confirmation (getConfirmCompletingPartySchema) and the
  // court order (getCourtOrderPoaSchema)
  return z.object({
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' }))
  })
}

export type ContinuationOutFormSchema = z.output<ReturnType<typeof getContinuationOutSchema>>
