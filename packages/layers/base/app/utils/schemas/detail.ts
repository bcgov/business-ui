import type { FormDetail } from '#components'
import { z } from 'zod'

export function getDetailSchema(maxLength = 1932) {
  const t = useNuxtApp().$i18n.t

  return z.object({
    detail: z.string()
      .trim()
      .min(1, t('connect.validation.fieldRequired'))
      .max(maxLength, t('connect.validation.maxChars', { count: maxLength }))
  })
}

export type DetailSchema = z.output<ReturnType<typeof getDetailSchema>>

export type FormDetailRef = InstanceType<typeof FormDetail>
