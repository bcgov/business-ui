import { z } from 'zod'

export function getOfficesSchema() {
  return z.object({
    id: z.string().default(() => crypto.randomUUID()),
    isEditing: z.boolean().default(false),
    actions: z.array(z.enum(ActionType)).default(() => []),
    type: z.enum(OfficeType).default(() => OfficeType.REGISTERED),
    address: getAddressWithIdSchema().default(() => ({
      deliveryAddress: {
        id: crypto.randomUUID(),
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      mailingAddress: {
        id: crypto.randomUUID(),
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'CA',
        locationDescription: ''
      },
      sameAs: false
    }))
  })
}

export type OfficesSchema = z.output<ReturnType<typeof getOfficesSchema>>

export function getActiveOfficesSchema() {
  return getOfficesSchema().nullable().optional()
}

export type ActiveOfficesSchema = z.output<ReturnType<typeof getActiveOfficesSchema>>
