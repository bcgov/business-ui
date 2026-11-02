import { z } from 'zod'

/** Allowed AGM year range. */
export function getAgmYearRange(foundingDate?: string) {
  const currentYear = new Date().getFullYear()
  const foundingYear = foundingDate ? new Date(foundingDate).getFullYear() : currentYear - 2

  return {
    currentYear,
    foundingYear,
    minYear: Math.max(currentYear - 2, foundingYear),
    maxYear: currentYear + 1
  }
}

/** Base schema for store defaults and type inference. */
export function getAgmLocationChangeSchema(isStaff: boolean) {
  // staff file the folio too - this filing has no fee, so there is no staff payment section
  const base = z.object({
    year: z.string().default(''),
    reason: z.string().default(''),
    agmLocation: z.object({
      country: z.string().default('CA'),
      city: z.string().default(''),
      region: z.string().default('')
    }).default(() => ({ country: 'CA', city: '', region: '' })),
    ...getFolioSectionShape()
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
export function getAgmLocationChangeValidationSchema(foundingDate?: string) {
  const t = useNuxtApp().$i18n.t
  const { currentYear, foundingYear, minYear, maxYear } = getAgmYearRange(foundingDate)

  return z.object({
    year: z.string()
      .min(1, t('validation.agmLocationChange.yearRequired'))
      .regex(/^\d{4}$/, t('validation.agmLocationChange.yearInvalid'))
      .refine(
        val => Number(val) >= minYear,
        foundingYear > currentYear - 2
          ? t('validation.agmLocationChange.yearBeforeFounding')
          : t('validation.agmLocationChange.yearMin', { year: minYear })
      )
      .refine(val => Number(val) <= maxYear, t('validation.agmLocationChange.yearMax', { year: maxYear })),
    reason: z.string()
      .trim()
      .min(1, t('validation.agmLocationChange.reasonRequired'))
      .max(2000, t('validation.agmLocationChange.reasonMax')),
    agmLocation: z.object({
      country: z.string().trim().min(1, t('validation.agmLocationChange.countryRequired')),
      city: z.string()
        .trim()
        .min(1, t('validation.agmLocationChange.cityRequired'))
        .max(40, t('validation.agmLocationChange.cityMax')),
      region: z.string().trim().max(2, t('validation.agmLocationChange.regionMax'))
    }).superRefine((val, ctx) => {
      // province/state is a required select for Canada and the US,
      // for other countries it's an optional region
      if ((val.country === 'CA' || val.country === 'US') && !val.region) {
        ctx.addIssue({
          code: 'custom',
          path: ['region'],
          message: t(val.country === 'CA'
            ? 'validation.agmLocationChange.provinceRequired'
            : 'validation.agmLocationChange.stateRequired')
        })
      }
    })
  })
}

type AgmLocationFields = z.output<ReturnType<typeof getAgmLocationChangeSchema>>['agmLocation']

export type AgmLocationChangeFormSchema = Partial<
  z.output<ReturnType<typeof getAgmLocationChangeSchema>>
  & { authorization: z.output<ReturnType<typeof getConfirmAuthorizationSchema>> }
  & { certify: z.output<ReturnType<typeof getCertifySchema>> }
> & { agmLocation: AgmLocationFields }
