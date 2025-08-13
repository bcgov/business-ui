import * as z from 'zod'

export interface certify {
    certified: boolean
    name: string
}

export const certifySchema = z.object({
    certified: z.literal(true),
    name: z.string().min(1, 'errors.required')
})