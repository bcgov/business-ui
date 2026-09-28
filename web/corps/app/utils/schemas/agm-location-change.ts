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
      staffPayment: getStaffPaymentSchema().default(() => ({
        option: StaffPaymentOption.NONE,
        bcolAccountNumber: '',
        datNumber: '',
        routingSlipNumber: '',
        folioNumber: '',
        isPriority: false
      }))
    })
  }

  return base.extend({
    certify: getCertifySchema().default(() => ({ isCertified: false }))
  })
}

/**
 * Validation schema for the main filing fields (year, reason, agmLocation).
 * Certify and folio are validated by their own nested form components.
 * Requires Nuxt context for i18n error messages.
 */
export function getAgmLocationChangeValidationSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    year: z.string()
      .min(1, t('validation.agmLocationChange.yearRequired'))
      .regex(/^\d{4}$/, t('validation.agmLocationChange.yearInvalid')),
    reason: z.string()
      .min(1, t('validation.agmLocationChange.reasonRequired'))
      .max(2000, t('validation.agmLocationChange.reasonMax')),
    agmLocation: z.string()
      .min(1, t('validation.agmLocationChange.locationRequired'))
      .max(400, t('validation.agmLocationChange.locationMax'))
  })
}

export type AgmLocationChangeFormSchema = Partial<
  z.output<ReturnType<typeof getAgmLocationChangeSchema>>
  & { staffPayment: z.output<ReturnType<typeof getStaffPaymentSchema>> }
>
