import type { FormConfirmAuthorization } from '#components'
import { z } from 'zod'

export function getConfirmAuthorizationSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    isAuthorized: z.literal<boolean>(true, t('validation.checkToContinue'))
  })
}

export type ConfirmAuthorizationSchema = z.output<ReturnType<typeof getConfirmAuthorizationSchema>>

export type ConfirmAuthorizationFormRef = InstanceType<typeof FormConfirmAuthorization>
