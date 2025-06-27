import * as z from 'zod'

export function getDeliveryAddressSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    street: z.string().min(1, t('validation.fieldRequired')).max(50, t('validation.maxChars', { count: 50 })),
    streetAdditional: z.string().max(50, t('validation.maxChars', { count: 50 })).optional(),
    city: z.string().min(1, t('validation.fieldRequired')).max(40, t('validation.maxChars', { count: 40 })),
    region: z.string().optional(),
    postalCode: z.string().min(1, t('validation.fieldRequired')).max(15, t('validation.maxChars', { count: 15 })),
    country: z.string().min(1, t('validation.fieldRequired')),
    locationDescription: z.string().max(80, t('validation.maxChars', { count: 80 })).optional()
  }).superRefine((data, ctx) => {
    // validate region based on country
    // required if country is US or CA
    // optional and max 2 characters if not US or CA
    const country = data.country
    const region = data.region

    if (region && region.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.maxChars', { count: 2 }),
        path: ['region']
      })
    }

    if ((country === 'US' || country === 'CA') && region?.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.fieldRequired'),
        path: ['region']
      })
    }

    return z.NEVER
  })
}

export function getMailingAddressSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    street: z
      .string()
      .min(1, t('validation.fieldRequired'))
      .max(50, t('validation.maxChars', { count: 50 }))
      .optional()
      .or(z.literal('')),
    streetAdditional: z
      .string()
      .max(50, t('validation.maxChars', { count: 50 }))
      .optional(),
    city: z
      .string()
      .min(1, t('validation.fieldRequired'))
      .max(40, t('validation.maxChars', { count: 40 }))
      .optional()
      .or(z.literal('')),
    region: z
      .string()
      .optional(),
    postalCode: z
      .string()
      .min(1, t('validation.fieldRequired'))
      .max(15, t('validation.maxChars', { count: 15 }))
      .optional()
      .or(z.literal('')),
    country: z
      .string()
      .min(1, t('validation.fieldRequired'))
      .optional()
      .or(z.literal('')),
    locationDescription: z
      .string()
      .max(80, t('validation.maxChars', { count: 80 }))
      .optional()
  }).superRefine((data, ctx) => {
    // validate region based on country
    // required if country is US or CA
    // optional and max 2 characters if not US or CA
    // const country = data.country
    const region = data.region

    if (region && region.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.maxChars', { count: 2 }),
        path: ['region']
      })
    }

    // if ((country === 'US' || country === 'CA') && region?.length === 0) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: t('validation.fieldRequired'),
    //     path: ['region']
    //   })
    // }

    return z.NEVER
  })
}
