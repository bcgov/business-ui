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
    parentShareIndex?: number // UI property - tracking the parent share index
}

export interface Share extends Series {
    series: Series[]
}

const seriesRefine = (input, ctx) => {
  const filingStore = usePostRestorationTransitionApplicationStore()
  let goodStanding = true
  const parent = filingStore.shareClasses[input.parentShareIndex]

  if (!parent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['name'],
      message: 'errors.parentShareRequired' // it shouldn't be possible to get this unless user breaks code
    })
    goodStanding = false
  }

  if (parent?.hasMaximumShares && parent?.maxNumberOfShares !== undefined) {
    const totalShareMax = parent.maxNumberOfShares
    let runningTotal = input.maxNumberOfShares || 0
    for (const series of parent.series) {
      if (series.maxNumberOfShares !== undefined) {
        runningTotal += series.maxNumberOfShares
      }
    }
    if (runningTotal > totalShareMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxNumberOfShares'],
        message: 'errors.exceedsNumberOfShares'
      })
      goodStanding = false
    }
  }

  return goodStanding
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

  if (Object.keys(input).includes('parentShareIndex')) {
    goodStanding = goodStanding && seriesRefine(input, ctx)
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
    priority: z.number(),
    parentShareIndex: z.number().optional().nullable() // UI property - tracking the parent share index
}).superRefine(refine)

export const shareSchema = seriesSchema.sourceType().extend({
    series: z.array(seriesSchema).optional()
}).superRefine(refine)
