import { z } from 'zod'
import type { FormPartyRole } from '#components'
import { RoleTypeUi } from '#business/app/enums/role-type'
import { RoleClass } from '#business/app/enums/role-class'
import { RoleFieldRequirement } from '#business/app/enums/role-field-requirement'

// a field's presence (either REQUIRED or OPTIONAL) means its section is shown for the role; absence hides it
export interface RoleFieldConfig {
  effectiveDate?: RoleFieldRequirement
  email?: RoleFieldRequirement
}

// single source of truth for which extra PartyDetails sections a role triggers
export const ROLE_FIELD_CONFIG: Partial<Record<RoleTypeUi, RoleFieldConfig>> = {
  [RoleTypeUi.DIRECTOR]: {
    effectiveDate: RoleFieldRequirement.REQUIRED
  },
  [RoleTypeUi.CUSTODIAN]: {
    email: RoleFieldRequirement.REQUIRED
  }
  // add other roles/fields as needed
}

export function getPartyRoleSchema(roleType?: RoleTypeUi) {
  const t = useNuxtApp().$i18n.t

  return z.array(z.object({
    appointmentDate: z.string().optional(),
    cessationDate: z.string().optional().nullable(),
    roleClass: z.enum(RoleClass).optional(),
    roleType: z.enum(RoleTypeUi)
  }))
    .min(1, { message: t('validation.role.min') })
    .default(() => (roleType ? [{ roleType }] : []))
    .superRefine((val, ctx) => {
      if (val?.length) {
        const activeRole = val.find(role => !role.cessationDate)
        if (!activeRole) {
          ctx.addIssue({
            code: 'custom',
            path: ['roles'],
            message: t('validation.role.min')
          })
        }
      }
    })
}

export type PartyRoleSchema = z.output<ReturnType<typeof getPartyRoleSchema>>

export type FormPartyRoleRef = InstanceType<typeof FormPartyRole>
