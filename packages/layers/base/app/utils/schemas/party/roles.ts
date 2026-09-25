import { z } from 'zod'
import type { FormPartyRole } from '#components'
import { RoleTypeUi } from '#business/app/enums/role-type'
import { RoleClass } from '#business/app/enums/role-class'
import { RoleFieldRequirement } from '#business/app/enums/role-field-requirement'

// a field's presence (either REQUIRED or OPTIONAL) means its section is shown for the role; absence hides it
export interface RoleFieldConfig {
  cessationDate?: RoleFieldRequirement
  effectiveDate?: RoleFieldRequirement
  email?: RoleFieldRequirement
}

// single source of truth for which extra PartyDetails sections a role triggers
export const ROLE_FIELD_CONFIG: Partial<Record<RoleTypeUi, RoleFieldConfig>> = {
  [RoleTypeUi.DIRECTOR]: {
    // cessationDate section is only shown once a director role has actually been ceased; once
    // shown it's required (can't leave it blank) - to undo a mistaken cessation, uncheck then
    // recheck the role instead of blanking the date
    cessationDate: RoleFieldRequirement.REQUIRED,
    effectiveDate: RoleFieldRequirement.REQUIRED
  },
  [RoleTypeUi.CUSTODIAN]: {
    email: RoleFieldRequirement.REQUIRED
  }
  // add other roles/fields as needed
}

/** A role type that can be ceased (has a cessationDate) shows its ceased parties in a separate tab. */
export function hasCeasedTab(roleType?: RoleTypeUi): boolean {
  return !!roleType && !!ROLE_FIELD_CONFIG[roleType]?.cessationDate
}

/** A party is ceased for a role type when all of its roles of that type have a cessation date. */
export function isPartyCeased(party: { roles: PartyRoleSchema }, roleType: RoleTypeUi): boolean {
  const roles = party.roles.filter(r => r.roleType === roleType)
  return roles.length > 0 && roles.every(r => !!r.cessationDate)
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
