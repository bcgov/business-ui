import { z } from 'zod'

/** Future: add the AGM date, registered office, director and certify (base FormCertify) sections. */
function getBaseSchema() {
  return z.object({})
}

/**
 * Coop annual report full form schema.
 */
export function getCoopAnnualReportSchema(isStaff: boolean) {
  return withPaymentSection(getBaseSchema(), isStaff)
}

export type CoopAnnualReportSchema = WithPaymentSections<ReturnType<typeof getBaseSchema>>
