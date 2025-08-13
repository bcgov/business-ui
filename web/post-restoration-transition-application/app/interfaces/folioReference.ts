import * as z from 'zod'

export const MAX_FOLIO_REF_LENGTH = 30
const message = 'errors.maxLength30'

export interface folioReference {
    folio: string | undefined
}

export const folioReferenceSchema = z.object({
    folio: z.string().max(MAX_FOLIO_REF_LENGTH, message).optional()
})