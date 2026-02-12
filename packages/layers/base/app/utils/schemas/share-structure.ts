import { z } from 'zod'
// import type { FormShareClass } from '#components'

export function getShareSeriesSchema(context?: { existingNames: string[], maxAllowedShares: number }) {
  return z.object({
    id: z.string().default(() => crypto.randomUUID()),
    actions: z.array(z.enum(ActionType)).default(() => []),
    priority: z.number().default(1),
    name: z.string()
      .min(1, 'This field is required')
      .max(50, 'Maximum 50 characters')
      .refine(val => !/\b(share|shares|value)\b/i.test(val), 'Class name cannot contain the term ‘share’, ‘shares’, or ‘value’')
      .refine(val => !context?.existingNames?.includes(val.toLowerCase().trim()), 'Name must be unique')
      .default(''),
    maxNumberOfShares: z.coerce.number('Only enter whole numbers').nullable().default(null),
    hasMaximumShares: z.boolean().default(false),
    hasRightsOrRestrictions: z.boolean().default(false),
    isInvalid: z.boolean().default(false)
  }).superRefine((data, ctx) => {
    if (data.hasMaximumShares) {
      const maxShares = data.maxNumberOfShares

      if (maxShares === null || maxShares === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'This field is required'
        })
        return
      }

      if (!Number.isInteger(maxShares)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'Only enter whole numbers'
        })
      }

      if (maxShares.toString().length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'Maximum 16 digits'
        })
      }

      if (context?.maxAllowedShares === 0 || (context?.maxAllowedShares && maxShares > context.maxAllowedShares)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'The maximum number for all series combined cannot exceed the maximum number for the class'
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
  return z.object({
    id: z.string().default(() => crypto.randomUUID()),
    actions: z.array(z.enum(ActionType)).default(() => []),
    priority: z.number().default(1),
    name: z.string()
      .min(1, 'This field is required')
      .max(50, 'Maximum 50 characters')
      .refine(val => !/\b(share|shares|value)\b/i.test(val), 'Class name cannot contain the term ‘share’, ‘shares’, or ‘value’')
      .refine(val => !context?.existingNames?.includes(val.toLowerCase().trim()), 'Name must be unique')
      .default(''),
    hasParValue: z.boolean().default(false),
    parValue: z.coerce.number('Only enter numbers')
      .nullable()
      .default(null),
    currency: z.preprocess(
      val => (val === null ? undefined : val),
      z.string().optional()
    ),
    hasMaximumShares: z.boolean().default(false),
    maxNumberOfShares: z.coerce.number('Only enter whole numbers')
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
          message: 'This field is required'
        })
      }

      const parValue = data.parValue

      if (parValue === null || parValue === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'This field is required'
        })
      }

      if (parValue && parValue <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Amount must be greater than 0'
        })
      }

      const parValueString = parValue && parValue.toString()

      if (parValueString && parValueString.replace('.', '').length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Maximum 16 digits'
        })
      }

      const decimalCount = (parValueString && parValueString.split('.')[1]?.length) || 0

      if (parValue && parValue < 1 && decimalCount > 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Amounts less than 1 can be entered with up to 6 decimal places'
        })
      } else if (parValue && parValue >= 1 && decimalCount > 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Amounts greater than 1 can be entered with up to 2 decimal places'
        })
      }
    }

    if (data.hasMaximumShares) {
      const maxShares = data.maxNumberOfShares

      if (maxShares === null || maxShares === undefined || maxShares.toString() === '' || maxShares === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'This field is required'
        })
        return
      }

      if (!Number.isInteger(maxShares)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'Only enter whole numbers'
        })
      }

      if (maxShares.toString().length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'Maximum 16 digits'
        })
      }

      const totalSeriesCount = data.series.reduce((a, c) => a + (c.maxNumberOfShares ?? 0), 0)

      if (totalSeriesCount > maxShares) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxNumberOfShares'],
          message: 'The maximum number for all series combined cannot exceed the maximum number for the class'
        })
      }
    }
  })
}

export type ShareClassSchema = z.output<ReturnType<typeof getShareClassSchema>>

// export type FormShareClassRef = InstanceType<typeof FormShareClass>

export function getActiveShareClassSchema(context?: { existingNames: string[] }) {
  return getShareClassSchema(context).nullable().optional()
}

export type ActiveShareClassSchema = z.output<ReturnType<typeof getActiveShareClassSchema>>
