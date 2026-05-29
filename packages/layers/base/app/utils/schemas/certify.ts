import type { FormCertify } from '#components'
import { z } from 'zod'

export function getCertifySchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    isCertified: z.literal<boolean>(true, t('validation.checkToContinue'))
  })
}

export type CertifySchema = z.output<ReturnType<typeof getCertifySchema>>

export type CertifyFormRef = InstanceType<typeof FormCertify>
