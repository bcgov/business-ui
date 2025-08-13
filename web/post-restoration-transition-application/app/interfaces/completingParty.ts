import * as z from 'zod'

export interface completingParty {
    email: string | ''
}

export const completingPartySchema = z.object({
    email: z.union([
      z.literal( '' ),
      z.string().email('errors.email')
    ])
})