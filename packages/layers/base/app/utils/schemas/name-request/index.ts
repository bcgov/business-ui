import { z } from 'zod'
import type { FormNameRequestNumber } from '#components'

export const NR_NUM_REGEX = /^(NR)?\s*(\d{7})$/i

// Name Request schema used in business filings
export function getNameRequestSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    changeToNumbered: z.boolean()
      .default(false),
    legalName: z.string()
      .min(1, t('validation.companyNameRequired'))
      .default(''),
    nrNumber: z.string()
      .min(1, t('validation.nrNumber.required'))
      .refine(val => NR_NUM_REGEX.test(val), t('validation.nrNumber.invalid'))
      .default('')
  })
}

export function getActiveNameRequestSchema() {
  return getNameRequestSchema().nullable().optional()
}

export type NameRequestSchema = z.output<ReturnType<typeof getNameRequestSchema>>

export type ActiveNameRequestSchema = z.output<ReturnType<typeof getActiveNameRequestSchema>>

export type FormNameRequestNumberRef = InstanceType<typeof FormNameRequestNumber>
