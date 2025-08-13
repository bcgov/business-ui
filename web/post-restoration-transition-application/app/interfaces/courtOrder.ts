import * as z from 'zod'

export const MAX_COURT_ORDER_LENGTH = 50
const message = 'errors.maxLength50'

export interface courtOrder {
    courtOrderNumber: string
}

export const courtOrderSchema = z.object({
    courtOrderNumber: z.string().max(MAX_COURT_ORDER_LENGTH, message)
})