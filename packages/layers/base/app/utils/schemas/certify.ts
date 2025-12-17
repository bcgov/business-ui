import type { FormCertify } from '#components'
import { z } from 'zod'

export function getCertifySchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    isCertified: z.literal<boolean>(true, t('connect.validation.required')),
    legalName: z.string()
      .min(1, t('connect.validation.fieldRequired'))
      .max(90, t('connect.validation.maxChars', { count: 90 }))
  })
}

export type CertifySchema = z.output<ReturnType<typeof getCertifySchema>>

export type CertifyFormRef = InstanceType<typeof FormCertify>
