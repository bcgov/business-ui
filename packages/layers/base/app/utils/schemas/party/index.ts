import { z } from 'zod'

export * from './name'

export function getPartySchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)).default([]),
    address: getAddressSchema().default({
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
    }),
    name: getPartyNameSchema().default({
      partyType: PartyType.PERSON,
      firstName: '',
      middleName: '',
      lastName: '',
      businessName: ''
    }),
    roles: z.array(z.object({
      appointmentDate: z.string().optional(),
      cessationDate: z.string().optional().nullable(),
      roleClass: z.enum(RoleClass).optional(),
      roleType: z.enum(RoleType).optional()
    })).optional().default([]),
    id: z.string().optional().default('')
  })
}

export type PartySchema = z.output<ReturnType<typeof getPartySchema>>

export function getActivePartySchema() {
  return getPartySchema().nullable().optional()
}

export type ActivePartySchema = z.output<ReturnType<typeof getActivePartySchema>>
