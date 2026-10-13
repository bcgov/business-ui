import { z } from 'zod'

function getAnnualReportBaseSchema() {
  return z.object({
    authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
  })
}

/**
 * Annual Report full form state.
 * Only the authorization confirmation and the payment details are collected.
 */
export function getAnnualReportSchema(isStaff: boolean) {
  return withPaymentSection(getAnnualReportBaseSchema(), isStaff)
}

export type AnnualReportFormSchema = WithPaymentSections<ReturnType<typeof getAnnualReportBaseSchema>>
