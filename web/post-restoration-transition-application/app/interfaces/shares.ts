import * as z from 'zod'

export interface Series {
    id: number | null // can be null when adding
    name: string
    currency: string | null
    hasMaximumShares: boolean
    hasParValue: boolean
    hasRightsOrRestrictions: boolean
    maxNumberOfShares: number | null
    parValue: number | null
    priority: number
}

export interface Share extends Series {
    series: Series[]
}

export const seriesSchema = z.object({
    name: z.string().min(1),
    currency: z.string().nullable(),
    hasMaximumShares: z.boolean(),
    hasParValue: z.boolean(),
    hasRightsOrRestrictions: z.boolean(),
    maxNumberOfShares: z.number().nullable(),
    parValue: z.number().nullable(),
    priority: z.number()
}).superRefine((input, ctx) => {
  let goodStanding = true
    if (input.hasMaximumShares) {
        goodStanding = goodStanding && input.maxNumberOfShares !== null
        if (input.maxNumberOfShares === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['maxNumberOfShares'],
            message: 'Maximum Number of Shares is required, when has maximum is selected'
          })
        }
    }

    if (input.hasParValue) {
        goodStanding = goodStanding && input.parValue !== null
        goodStanding = goodStanding && input.currency !== null
        if (input.parValue === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parValue'],
            message: 'Par Value is required, when has par value is selected'
          })
        }
        if (input.currency === null || input.currency === '') {
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
