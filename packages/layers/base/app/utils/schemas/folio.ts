import { z } from 'zod'
import type { FormFolio } from '#components'

export function getFolioSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    folioNumber: z.string().max(30, t('connect.validation.maxChars', { count: 30 })).optional()
  })
}

export type FolioSchema = z.output<ReturnType<typeof getFolioSchema>>

export type FormFolioRef = InstanceType<typeof FormFolio>
