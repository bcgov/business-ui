import type { FormConfirmCompletingParty } from '#components'
import { z } from 'zod'

export function getConfirmCompletingPartySchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    // the error shorthand covers the type-level failure too - a cleared input emits
    // undefined, which would otherwise surface zod's default "expected string" message
    completingPartyName: z
      .string(t('validation.completingPartyNameRequired'))
      .min(1, t('validation.completingPartyNameRequired')),
    confirmed: z.literal<boolean>(true, t('validation.checkToContinue'))
  })
}

export type ConfirmCompletingPartySchema = z.output<ReturnType<typeof getConfirmCompletingPartySchema>>

export type FormConfirmCompletingPartyRef = InstanceType<typeof FormConfirmCompletingParty>
