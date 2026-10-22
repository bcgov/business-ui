import { z } from 'zod'

function getReviewImportedDataBaseSchema() {
  return z.object({
    activeOffice: getActiveOfficesSchema(),
    activeDirector: getActivePartySchema(),
    // client only - staff certify through the staff payment section
    certify: getCertifySchema().default(() => ({ isCertified: false }))
  })
}

/**
 * The review imported data full form state.
 */
export function getReviewImportedDataSchema(isStaff: boolean) {
  return withPaymentSection(getReviewImportedDataBaseSchema(), isStaff)
}

export type ReviewImportedDataFormSchema = WithPaymentSections<ReturnType<typeof getReviewImportedDataBaseSchema>>
