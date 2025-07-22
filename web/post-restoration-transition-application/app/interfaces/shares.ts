import * as z from 'zod'

export interface Series {
    id: number | undefined // can be undefined when adding
    name: string
    currency: string | undefined
    hasMaximumShares: boolean
    hasParValue: boolean
    hasRightsOrRestrictions: boolean
    maxNumberOfShares: number | undefined
    parValue: number | undefined
    priority: number
}

export interface Share extends Series {
    series: Series[]
}

export const seriesSchema = z.object({
    name: z.string().min(1),
    currency: z.string().optional(),
    hasMaximumShares: z.boolean(),
    hasParValue: z.boolean(),
    hasRightsOrRestrictions: z.boolean(),
    maxNumberOfShares: z.number().optional(),
    parValue: z.number().optional(),
    priority: z.number()
}).superRefine((input, ctx) => {
  let goodStanding = true
    if (input.hasMaximumShares) {
        goodStanding = goodStanding && input.maxNumberOfShares !== undefined
        if (input.maxNumberOfShares === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['maxNumberOfShares'],
            message: 'Maximum Number of Shares is required, when has maximum is selected'
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
            message: 'Par Value is required, when has par value is selected'
          })
        }
        if (input.currency === undefined || input.currency === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['currency'],
            message: 'Currency is required, when has par value is selected'
          })
        }
    }

    return goodStanding
})

export const shareSchema = z.object({
    series: z.array(seriesSchema).optional()
})
