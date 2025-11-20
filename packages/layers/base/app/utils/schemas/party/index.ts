import { z } from 'zod'

export * from './name'

export function getPartySchema() {
  return z.object({
    actions: z.array(z.enum(ActionType)),
    address: getAddressSchema(),
    name: getPartyNameSchema(),
    roles: z.array(z.object({
      appointmentDate: z.string().optional(),
      cessationDate: z.string().optional(),
      roleClass: z.enum(RoleClass).optional(),
      roleType: z.enum(RoleType).optional()
    })).optional(),
    id: z.string().optional()
  })
}

export type PartySchema = z.output<ReturnType<typeof getPartySchema>>
