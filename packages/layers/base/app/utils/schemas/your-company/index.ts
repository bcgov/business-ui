import { z } from 'zod'

// TODO/FUTURE: refine validations + add i18n
export function getActiveYourCompanySchema() {
  return z.discriminatedUnion('key', [
    // Continuation In / Out Names
    z.object({
      key: z.literal('nameNewJurisdiction'),
      value: z.string().trim().min(1, 'Name in new jurisdiction is required')
    }),
    z.object({
      key: z.literal('namePreviousJurisdiction'),
      value: z.string().trim().min(1, 'Name in previous jurisdiction is required')
    }),

    // Identification / Extrapro Numbers
    z.object({
      key: z.literal('numberExpro'),
      value: z.string().trim().min(1, 'Extra-provincial registration number is required')
    }),
    z.object({
      key: z.literal('numberPreviousJurisdiction'),
      value: z.string().trim().min(1, 'Previous jurisdiction number is required')
    }),

    // Amalgamation Out / Continuation Out Dates
    z.object({
      key: z.literal('outDate'),
      value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    }),

    // Jurisdictions
    z.object({
      key: z.literal('previousJurisdiction'),
      value: z.object({
        country: z.string().min(1, 'Country is required'),
        region: z.string().nullable()
      })
    }),
    z.object({
      key: z.literal('newJurisdiction'),
      value: z.object({
        country: z.string().min(1, 'Country is required'),
        region: z.string().nullable()
      })
    }),

    // Name Request
    z.object({
      key: z.literal('nameRequest'),
      value: getNameRequestSchema()
    }),

    // Legal Type (also known as entity type or corp type)
    z.object({
      key: z.literal('legalType'),
      value: z.enum(CorpTypeCd)
    })
  ]).optional()
}

export type ActiveYourCompanySchema = z.infer<ReturnType<typeof getActiveYourCompanySchema>>
