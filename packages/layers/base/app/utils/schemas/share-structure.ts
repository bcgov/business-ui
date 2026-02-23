import { z } from 'zod'

export function getShareSeriesSchema(context?: { existingNames: string[], maxAllowedShares: number }) {
  const t = useNuxtApp().$i18n.t
  return z.object({
    id: z.string().default(() => crypto.randomUUID()),
    actions: z.array(z.enum(ActionType)).default(() => []),
    priority: z.number().default(1),
    name: z.string()
      .min(1, t('connect.validation.fieldRequired'))
      .max(50, t('connect.validation.maxChars', 50))
      .refine(val => !/\b(share|shares|value)\b/i.test(val), t('validation.seriesNameInvalidWords'))
      .refine(val => !context?.existingNames?.includes(val.toLowerCase().trim()), t('validation.uniqueName'))
      .default(''),
    maxNumberOfShares: z.coerce.number(t('validation.onlyWholeNumbers')).nullable().default(null),
    hasMaximumShares: z.boolean().default(false),
    hasRightsOrRestrictions: z.boolean().default(false),
    isInvalid: z.boolean().default(false)
  }).superRefine((data, ctx) => {
    if (data.hasMaximumShares) {
      const maxShares = data.maxNumberOfShares

      if (maxShares === null || maxShares === undefined || maxShares.toString() === '' || maxShares === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('connect.validation.fieldRequired')
        })
        return
      }

      if (!Number.isInteger(maxShares)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('validation.onlyWholeNumbers')
        })
      }

      if (maxShares.toString().length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('validation.maxDigits', 16)
        })
      }

      if (context?.maxAllowedShares === 0 || (context?.maxAllowedShares && maxShares > context.maxAllowedShares)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('validation.totalOfAllSeriesCantExceedMaxOfClass')
        })
      }
    }
  })
}

export type ShareSeriesSchema = z.output<ReturnType<typeof getShareSeriesSchema>>

export function getActiveShareSeriesSchema(context?: { existingNames: string[], maxAllowedShares: number }) {
  return getShareSeriesSchema(context).nullable().optional()
}

export type ActiveShareSeriesSchema = z.output<ReturnType<typeof getActiveShareSeriesSchema>>

export function getShareClassSchema(context?: { existingNames: string[] }) {
  const t = useNuxtApp().$i18n.t
  return z.object({
    id: z.string().default(() => crypto.randomUUID()),
    actions: z.array(z.enum(ActionType)).default(() => []),
    priority: z.number().default(1),
    name: z.string()
      .min(1, t('connect.validation.fieldRequired'))
      .max(50, t('connect.validation.maxChars', 50))
      .refine(val => !/\b(share|shares|value)\b/i.test(val), t('validation.classNameInvalidWords'))
      .refine(val => !context?.existingNames?.includes(val.toLowerCase().trim()), t('validation.uniqueName'))
      .default(''),
    hasParValue: z.boolean().default(false),
    parValue: z.preprocess(
      val => (val === '' || val === undefined ? null : val),
      z.coerce.number(t('validation.onlyNumbers')).nullable().default(null)
    ),
    currency: z.preprocess(
      val => (val === null ? undefined : val),
      z.string().optional()
    ),
    hasMaximumShares: z.boolean().default(false),
    maxNumberOfShares: z.coerce.number(t('validation.onlyWholeNumbers'))
      .nullable()
      .default(null),
    hasRightsOrRestrictions: z.boolean().default(false),
    series: z.array(getShareSeriesSchema()).optional().default(() => [])
  }).superRefine((data, ctx) => {
    if (data.hasParValue) {
      if (!data.currency) {
        ctx.addIssue({
          code: 'custom',
          path: ['currency'],
          message: t('connect.validation.fieldRequired')
        })
      }

      const parValue = data.parValue

      if (parValue === null || parValue === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: t('connect.validation.fieldRequired')
        })
      } else if (parValue <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: t('validation.amountMustBeGreaterThan', 0)
        })
      }

      const parValueString = parValue && parValue.toString()

      if (parValueString && parValueString.replace('.', '').length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: t('validation.maxDigits', 16)
        })
      }

      const decimalCount = (parValueString && parValueString.split('.')[1]?.length) || 0

      if (parValue && parValue < 1 && decimalCount > 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: t('validation.maxDecimalsLessThanOne', 6)
        })
      } else if (parValue && parValue >= 1 && decimalCount > 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: t('validation.maxDecimalsGreaterThanOne', 2)
        })
      }
    }

    if (data.hasMaximumShares) {
      const maxShares = data.maxNumberOfShares

      if (maxShares === null || maxShares === undefined || maxShares.toString() === '' || maxShares === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('connect.validation.fieldRequired')
        })
        return
      }

      if (!Number.isInteger(maxShares)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('validation.onlyWholeNumbers')
        })
      }

      if (maxShares.toString().length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('validation.maxDigits', 16)
        })
      }

      const totalSeriesCount = data.series
        .filter(s => !s.actions?.includes(ActionType.REMOVED))
        .reduce((a, c) => a + (c.maxNumberOfShares ?? 0), 0)

      if (totalSeriesCount > maxShares) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: t('validation.totalOfAllSeriesCantExceedMaxOfClass')
        })
      }
    }
  })
}

export type ShareClassSchema = z.output<ReturnType<typeof getShareClassSchema>>

export function getActiveShareClassSchema(context?: { existingNames: string[] }) {
  return getShareClassSchema(context).nullable().optional()
}

export type ActiveShareClassSchema = z.output<ReturnType<typeof getActiveShareClassSchema>>
