import { z } from 'zod'
import { DateTime } from 'luxon'

export function getDodSchema() {
  const inSixMonths = DateTime.now().setZone('America/Vancouver').plus({ months: 6 }).toISODate()! // set zone may return null if timezone is invalid, we know America/Vancouver is valid

  return z.object({
    addToLedger: z.boolean().default(false),
    certify: getCertifySchema().default({ isCertified: false, legalName: '' }),
    courtOrder: getCourtOrderPoaSchema().default({
      hasPoa: false,
      courtOrderNumber: ''
    }),
    delay: getDelayDateSchema().default({ option: DelayOption.DEFAULT, date: inSixMonths }),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

export type DodSchema = z.output<ReturnType<typeof getDodSchema>>
