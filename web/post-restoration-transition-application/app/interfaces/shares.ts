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
    added?: boolean // UI property - tracking if the share got added
    modified?: boolean // UI property - tracking if the share got modified
}

export interface Share extends Series {
    series: Series[]
}

const seriesRefine = (input, ctx) => {
  const filingStore = usePostRestorationTransitionApplicationStore()
  // is true if no errors, false otherwise
  let noErrors = true
  const parent = filingStore.shareClasses[input.parentShareIndex]

  if (!parent) {
    throw new Error('errors.parentShareRequired')
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
      noErrors = false
    }
  }

  return noErrors
}

const refine = (input, ctx) => {
  // is true if no errors, false otherwise
  let noErrors = true
  if (input.hasMaximumShares) {
    noErrors = noErrors && input.maxNumberOfShares !== undefined
      if (input.maxNumberOfShares === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxNumberOfShares'],
          message: 'errors.maxNumberOfShares'
        })
      }
  }

  if (input.hasParValue) {
    noErrors = noErrors && input.parValue !== undefined
    noErrors = noErrors && input.currency !== undefined
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
    noErrors = noErrors && seriesRefine(input, ctx)
  }

  return noErrors
}

const baseShareSeriesSchema = z.object({
    name: z.string().min(1, 'errors.required'),
    currency: z.string().optional().nullable(),
    hasMaximumShares: z.boolean(),
    hasParValue: z.boolean(),
    hasRightsOrRestrictions: z.boolean(),
    maxNumberOfShares: z.number().optional().nullable(),
    parValue: z.number().optional().nullable(),
    priority: z.number(),
    parentShareIndex: z.number().optional().nullable() // UI property - tracking the parent share index
})

export const seriesSchema = baseShareSeriesSchema.superRefine(refine)

export const shareSchema = baseShareSeriesSchema.extend({
    isShareClass: true,
    series: z.array(seriesSchema).optional()
}).superRefine(refine)
