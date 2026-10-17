import { z } from 'zod'

/** Base schema for store defaults and type inference. */
export function getChangeOfDirectorsSchema(isStaff: boolean) {
  const base = z.object({
    codDate: z.string().default('')
  })

  if (isStaff) {
    return base.extend({
      authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
    })
  }

  return base.extend({
    certify: getCertifySchema().default(() => ({ isCertified: false }))
  })
}

/**
 * Validation schema for the COD date field.
 * Requires Nuxt context for i18n error messages and business context for date range.
 */
export type ChangeOfDirectorsFormSchema = Partial<
  z.output<ReturnType<typeof getChangeOfDirectorsSchema>>
  & { authorization: z.output<ReturnType<typeof getConfirmAuthorizationSchema>> }
  & { certify: z.output<ReturnType<typeof getCertifySchema>> }
>

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
