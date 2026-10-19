import { z } from 'zod'

function getChangeOfDirectorsBaseSchema() {
  return z.object({
    codDate: z.string().default('')
  })
}

/** Full form state schema — certify for clients, authorization + staffPayment for staff. */
export function getChangeOfDirectorsSchema(isStaff: boolean) {
  if (isStaff) {
    return withPaymentSection(
      getChangeOfDirectorsBaseSchema().extend({
        authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
      }),
      true
    )
  }

  return withPaymentSection(
    getChangeOfDirectorsBaseSchema().extend({
      certify: getCertifySchema().default(() => ({ isCertified: false }))
    }),
    false
  )
}

export type ChangeOfDirectorsFormSchema
  = WithPaymentSections<ReturnType<typeof getChangeOfDirectorsBaseSchema>>
    & Partial<{
      authorization: z.output<ReturnType<typeof getConfirmAuthorizationSchema>>
      certify: z.output<ReturnType<typeof getCertifySchema>>
    }>

export function getChangeOfDirectorsValidationSchema(minDate?: string) {
  const t = useNuxtApp().$i18n.t
  const today = getToday('America/Vancouver')

  return z.object({
    codDate: z.string()
      .min(1, t('validation.changeOfDirectors.dateRequired'))
      .refine(val => val <= today, t('validation.changeOfDirectors.dateFuture'))
      .refine(val => !minDate || val >= minDate, t('validation.changeOfDirectors.dateMin'))
  })
}
