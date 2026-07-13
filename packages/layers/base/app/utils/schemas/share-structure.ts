import { z } from 'zod'

export function getShareSeriesSchema(context?: { existingNames: string[], maxAllowedShares: number }) {
  const t = useNuxtApp().$i18n.t
  return z.object({
    isEditing: z.boolean().default(false),
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
    isEditing: z.boolean().default(false),
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
    currencyAdditional: z.preprocess(
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
          message: t('validation.maxSharesOfClassCannotBeLessThanAllSeriesCombined')
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

export function getResolutionDateSchema(context?: {
  hasRightsOrRestrictions?: boolean
  isEditingExisting?: boolean
  existingResolutions?: { id: string, date: string, type?: string }[]
}) {
  const t = useNuxtApp().$i18n.t
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

  return z.object({
    id: z.preprocess( // convert DB `id` int to string for UI diff'ing
      val => (typeof val === 'number' ? String(val) : val),
      z.string().default(() => crypto.randomUUID())
    ),
    type: z.string().optional(),
    date: z.string().default(''),
    isEditing: z.boolean().default(false),
    actions: z.array(z.enum(ActionType)).default(() => [])
  }).superRefine((data, ctx) => {
    const date = data.date.trim()
    const isDateEmpty = date === ''

    // Date required when adding or editing a share class or series with special rights or restrictions
    if (context?.hasRightsOrRestrictions && isDateEmpty) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('validation.resolutionDate.requiredWithSpecialRightsOrRestrictions')
      })
      return
    }

    // Date required when editing an existing date
    if (context?.isEditingExisting && isDateEmpty) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('connect.validation.fieldRequired')
      })
      return
    }

    // Date must pass YYYY-MM-DD regex (datepicker outputs correct format - fallback check when entered manually)
    if (!dateRegex.test(date) && !isDateEmpty) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: t('validation.dateFormat')
      })
      return
    }

    // Prevent duplicate dates being entered unless the IDs match (editing existing date)
    if (context?.existingResolutions && !isDateEmpty) {
      const isDuplicate = context.existingResolutions.some(res =>
        res.date.trim() === date && res.id !== data.id
      )

      if (isDuplicate) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: t('validation.resolutionDate.alreadyAdded')
        })
        return
      }
    }
  })
}

export type ResolutionDateSchema = z.output<ReturnType<typeof getResolutionDateSchema>>
