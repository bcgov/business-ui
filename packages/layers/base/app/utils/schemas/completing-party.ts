import { z } from 'zod'
import type { FormCompletingParty } from '#components'

export function getCompletingPartySchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    firstName: z.string()
      .max(20, t('connect.validation.maxChars', { count: 20 }))
      .default(''),
    middleName: z.string()
      .max(20, t('connect.validation.maxChars', { count: 20 }))
      .default(''),
    lastName: z.string()
      .min(1, t('validation.enterLastName'))
      .max(30, t('connect.validation.maxChars', { count: 30 }))
      .default(''),
    mailingAddress: getRequiredAddressSchema()
  })
}

export type CompletingPartySchema = z.output<ReturnType<typeof getCompletingPartySchema>>

export type FormCompletingPartyRef = InstanceType<typeof FormCompletingParty>
