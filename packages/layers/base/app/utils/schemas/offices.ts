import { z } from 'zod'

export function getOfficesSchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
    type: z.enum(OfficeType).default(() => OfficeType.UNKNOWN),
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
  return getOfficesSchema().nullable().optional()
}

export type ActiveOfficesSchema = z.output<ReturnType<typeof getActiveOfficesSchema>>
