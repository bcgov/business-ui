import { z } from 'zod'
import type { FormPartyEmail } from '#components'

export function getPartyEmailSchema(required = true) {
  const t = useNuxtApp().$i18n.t
  const emailFormat = z.email()

  return z.object({
    email: z.string().superRefine((val, ctx) => {
      if (val.length === 0) {
        if (required) {
          ctx.addIssue({ code: 'custom', message: t('validation.fieldRequired') })
        }
        return
      }
      if (val.length > 254) {
        ctx.addIssue({ code: 'custom', message: t('connect.validation.maxChars', { count: 254 }) })
        return
      }
      if (!emailFormat.safeParse(val).success) {
        ctx.addIssue({ code: 'custom', message: t('validation.validEmailAddressRequired') })
      }
    })
  })
}

export type PartyEmailSchema = z.output<ReturnType<typeof getPartyEmailSchema>>

export type FormPartyEmailRef = InstanceType<typeof FormPartyEmail>
