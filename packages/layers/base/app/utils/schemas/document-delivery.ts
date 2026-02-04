// https://zod.dev/api#emails
import { z } from 'zod'
import type { FormDocumentDelivery } from '#components'

export function getDocumentDeliverySchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    completingPartyEmail: z.preprocess(
      val => (val === '' ? undefined : val),
      z.email(t('validation.invalidEmailAddress')).optional()
    )
  })
}

export type DocumentDeliverySchema = z.output<ReturnType<typeof getDocumentDeliverySchema>>

export type FormDocumentDeliveryRef = InstanceType<typeof FormDocumentDelivery>
