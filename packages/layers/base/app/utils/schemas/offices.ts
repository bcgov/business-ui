import { z } from 'zod'

export function getOfficesSchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
    type: z.string(),
    address: getAddressSchema().default(() => ({
      deliveryAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      mailingAddress: {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      sameAs: false
    })),
    id: z.string().optional().default(() => '')
  })
}

export type OfficesSchema = z.output<ReturnType<typeof getOfficesSchema>>

export function getActiveOfficesSchema() {
  return getPartySchema().nullable().optional()
}

export type ActiveOfficesSchema = z.output<ReturnType<typeof getActiveOfficesSchema>>
