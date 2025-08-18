import { z } from 'zod'

export interface Series {
    id?: number // can be undefined when adding
    name: string
    currency?: string
    hasMaximumShares: boolean
    hasParValue: boolean
    hasRightsOrRestrictions: boolean
    maxNumberOfShares?: number
    parValue?: number
    priority: number
    removed?: boolean // UI property - tracking if the share got removed
}

export interface Share extends Series {
    series: Series[]
}

const refine = (input, ctx) => {
  let goodStanding = true
  if (input.hasMaximumShares) {
      goodStanding = goodStanding && input.maxNumberOfShares !== undefined
      if (input.maxNumberOfShares === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxNumberOfShares'],
          message: 'errors.maxNumberOfShares'
        })
      }
  }

  if (input.hasParValue) {
      goodStanding = goodStanding && input.parValue !== undefined
      goodStanding = goodStanding && input.currency !== undefined
      if (input.parValue === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parValue'],
          message: 'errors.parValue'
        })
      }
      if (input.currency === undefined || input.currency === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currency'],
          message: 'errors.currency'
        })
      }
  }

  return goodStanding
}

export const seriesSchema = z.object({
    name: z.string().min(1, 'errors.required'),
    currency: z.string().optional().nullable(),
    hasMaximumShares: z.boolean(),
    hasParValue: z.boolean(),
    hasRightsOrRestrictions: z.boolean(),
    maxNumberOfShares: z.number().optional().nullable(),
    parValue: z.number().optional().nullable(),
    priority: z.number()
}).superRefine(refine)

export const shareSchema = seriesSchema.sourceType().extend({
    series: z.array(seriesSchema).optional()
}).superRefine(refine)
