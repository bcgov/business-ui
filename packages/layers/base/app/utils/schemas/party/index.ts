import { z } from 'zod'

export * from './name'
export * from './roles'

export function getPartySchema(roleType?: RoleTypeUi) {
  return z.object({
    actions: z.array(z.enum(ActionType)).default(() => []),
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
    name: getPartyNameSchema().default({
      partyType: PartyType.PERSON,
      firstName: '',
      middleName: '',
      lastName: '',
      businessName: '',
      hasPreferredName: false,
      preferredName: ''
    }),
    roles: getPartyRoleSchema(roleType),
    id: z.string().optional().default(() => '')
  })
}

export type PartySchema = z.output<ReturnType<typeof getPartySchema>>

export function getActivePartySchema(roleType?: RoleTypeUi) {
  return getPartySchema(roleType).nullable().optional()
}

export type ActivePartySchema = z.output<ReturnType<typeof getActivePartySchema>>
