import type { FormConfirmAuthorization } from '#components'
import { z } from 'zod'

export function getConfirmAuthorizationSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    isAuthorized: z.literal<boolean>(true, t('validation.checkToContinue')),
    completingParty: z.string().optional()
  })
}

/** Staff variant: the completing party name is required. */
export function getConfirmAuthorizationStaffSchema() {
  const t = useNuxtApp().$i18n.t

  return getConfirmAuthorizationSchema().extend({
    completingParty: z.string(t('validation.completingPartyNameRequired'))
      .trim()
      .min(1, t('validation.completingPartyNameRequired'))
  })
}

/** The unchecked, empty starting state for flows that collect the completing party. */
export function getConfirmAuthorizationDefaults(): ConfirmAuthorizationSchema {
  return { isAuthorized: false as unknown as true, completingParty: '' }
}

export type ConfirmAuthorizationSchema = z.output<ReturnType<typeof getConfirmAuthorizationSchema>>

export type ConfirmAuthorizationFormRef = InstanceType<typeof FormConfirmAuthorization>
