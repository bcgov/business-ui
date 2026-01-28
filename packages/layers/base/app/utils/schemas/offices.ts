import { z } from 'zod'

export function getOfficesSchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
    type: z.enum(OfficeType).default(() => OfficeType.UNKNOWN),
    address: getAddressSchema().default(() => ({
      // NOTE/FUTURE: may need to include address id in here to compare against api data
      // this would require an update to the ConnectAddress interface and the formatAddressUi util
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
    }))
  })
}

export type OfficesSchema = z.output<ReturnType<typeof getOfficesSchema>>

export function getActiveOfficesSchema() {
  return getOfficesSchema().nullable().optional()
}

export type ActiveOfficesSchema = z.output<ReturnType<typeof getActiveOfficesSchema>>
