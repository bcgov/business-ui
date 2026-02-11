import { z } from 'zod'
// import type { FormShareClass } from '#components'

export function getShareSeriesSchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
    name: z.string().min(1).default(''),
    priority: z.number().default(1),
    maxNumberOfShares: z.number().nullable().default(null),
    hasMaximumShares: z.boolean().default(false),
    hasRightsOrRestrictions: z.boolean().default(false),
    id: z.string().default(() => crypto.randomUUID())
  })
}

export type ShareSeriesSchema = z.output<ReturnType<typeof getShareSeriesSchema>>

export function getActiveShareSeriesSchema() {
  return getShareSeriesSchema().nullable().optional()
}

export type ActiveShareSeriesSchema = z.output<ReturnType<typeof getActiveShareSeriesSchema>>

export function getShareClassSchema(nameList?: string[]) {
  return z.object({
    id: z.string().default(() => crypto.randomUUID()),
    actions: z.array(z.enum(ActionType)).default(() => []),
    priority: z.number().default(1),
    name: z.string()
      .min(1, 'This field is required')
      .max(50, 'Maximum 50 characters')
      .refine(val => !/\b(share|shares|value)\b/i.test(val), 'Class name cannot contain the term ‘share’, ‘shares’, or ‘value’')
      .refine(val => !nameList?.includes(val.toLowerCase().trim()), 'Name must be unique')
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
        return
      }

      if (parValue <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Amount must be greater than 0'
        })
        return
      }

      const parValueString = parValue.toString()

      if (parValueString.replace('.', '').length > 16) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Maximum 16 digits'
        })
      }

      const decimalCount = parValueString.split('.')[1]?.length || 0

      if (parValue < 1 && decimalCount > 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Amounts less than 1 can be entered with up to 6 decimal places'
        })
      } else if (parValue >= 1 && decimalCount > 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['parValue'],
          message: 'Amounts greater than 1 can be entered with up to 2 decimal places'
        })
      }
    }

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

      const totalMaxSeries = data.series.reduce((a, c) => a + (c.maxNumberOfShares ?? 0), 0)

      if (totalMaxSeries > maxShares) {
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

export function getActiveShareClassSchema(nameList?: string[]) {
  return getShareClassSchema(nameList).nullable().optional()
}

export type ActiveShareClassSchema = z.output<ReturnType<typeof getActiveShareClassSchema>>
