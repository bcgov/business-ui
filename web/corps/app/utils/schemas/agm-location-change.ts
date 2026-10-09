import { z } from 'zod'

/** Base schema for store defaults and type inference. */
export function getAgmLocationChangeSchema(isStaff: boolean) {
  const base = z.object({
    year: z.string().default(''),
    reason: z.string().default(''),
    agmLocation: z.string().default('')
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
 * Validation schema for the main filing fields (year, reason, agmLocation).
 * Certify and authorization are validated by their own nested form components.
 * Requires Nuxt context for i18n error messages and business context for year range.
 */
export function getAgmLocationChangeValidationSchema() {
  const t = useNuxtApp().$i18n.t
  const currentYear = new Date().getFullYear()
  const maxYear = currentYear + 1
  const minYear = currentYear - 2

  return z.object({
    year: z.string()
      .min(1, t('validation.agmLocationChange.yearRequired'))
      .regex(/^\d{4}$/, t('validation.agmLocationChange.yearInvalid'))
      .refine(val => Number(val) >= minYear, t('validation.agmLocationChange.yearMin', { year: minYear }))
      .refine(val => Number(val) <= maxYear, t('validation.agmLocationChange.yearMax', { year: maxYear })),
    reason: z.string()
      .trim()
      .min(1, t('validation.agmLocationChange.reasonRequired'))
      .max(2000, t('validation.agmLocationChange.reasonMax')),
    agmLocation: z.string()
      .trim()
      .min(1, t('validation.agmLocationChange.locationRequired'))
      .max(100, t('validation.agmLocationChange.locationMax'))
  })
}

export type AgmLocationChangeFormSchema = Partial<
  z.output<ReturnType<typeof getAgmLocationChangeSchema>>
  & { authorization: z.output<ReturnType<typeof getConfirmAuthorizationSchema>> }
  & { certify: z.output<ReturnType<typeof getCertifySchema>> }
>
