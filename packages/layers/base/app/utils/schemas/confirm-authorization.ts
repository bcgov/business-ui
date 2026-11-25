import type { FormConfirmAuthorization } from '#components'
import { z } from 'zod'

export function getConfirmAuthorizationSchema(options: { requireCompletingParty?: boolean } = {}) {
  const t = useNuxtApp().$i18n.t

  return z.object({
    isAuthorized: z.literal<boolean>(true, t('validation.checkToContinue')),
    completingParty: options.requireCompletingParty
      ? z.string(t('validation.completingPartyNameRequired'))
        .trim()
        .min(1, t('validation.completingPartyNameRequired'))
      : z.string().optional()
  })
}

export type ConfirmAuthorizationSchema = z.output<ReturnType<typeof getConfirmAuthorizationSchema>>

export type ConfirmAuthorizationFormRef = InstanceType<typeof FormConfirmAuthorization>
