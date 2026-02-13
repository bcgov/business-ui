import { z } from 'zod'
import type { FormPartyRole } from '#components'

export function getPartyRoleSchema(roleType?: RoleTypeUi) {
  const t = useNuxtApp().$i18n.t

  return z.array(z.object({
    appointmentDate: z.string().optional(),
    cessationDate: z.string().optional().nullable(),
    roleClass: z.enum(RoleClass).optional(),
    roleType: z.enum(RoleTypeUi)
  }))
    .min(1, { message: t('validation.role.min') })
    .default(roleType ? [{ roleType }] : [])
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
