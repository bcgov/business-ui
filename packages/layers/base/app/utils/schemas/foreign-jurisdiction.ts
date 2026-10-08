import { z } from 'zod'
import type { FormForeignJurisdiction, FormForeignJurisdictionField } from '#components'

/**
 * For the combined jurisdiction menu (getJurisdictionMenuItems):
 * - jurisdiction is required
 * - Canadian selections always carry a region (not BC, includes FEDERAL)
 * - region-less selections (international countries) are stored as null
 */
export function getForeignJurisdictionSchema() {
  const t = useNuxtApp().$i18n.t

  return z.object({
    country: z.string().min(1, t('validation.jurisdictionRequired')),
    region: z.string().nullable().optional()
  }).superRefine((val, ctx) => {
    if (val.country === 'CA' && !val.region) {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.jurisdictionRegionRequired'),
        path: ['region']
      })
    }

    if (val.country === 'CA' && val.region === 'BC') {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.jurisdictionRegionNotBc'),
        path: ['region']
      })
    }
  })
}

export type ForeignJurisdictionSchema = z.output<ReturnType<typeof getForeignJurisdictionSchema>>

export type FormForeignJurisdictionRef = InstanceType<typeof FormForeignJurisdiction>

export type FormForeignJurisdictionFieldRef = InstanceType<typeof FormForeignJurisdictionField>
