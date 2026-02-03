import { z } from 'zod'

export function getDodSchema() {
  return z.object({
    addToLedger: z.boolean().default(false),
    certify: getCertifySchema().default({ isCertified: false, legalName: '' }),
    courtOrder: getCourtOrderPoaSchema().default({
      hasPoa: false,
      courtOrderNumber: ''
    }),
    delay: getDelayDateSchema().default({ option: DelayOption.DEFAULT, date: '' }),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

export type DodSchema = z.output<ReturnType<typeof getDodSchema>>
