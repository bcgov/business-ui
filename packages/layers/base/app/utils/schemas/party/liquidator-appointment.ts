import type { z } from 'zod'
import type { FormLiquidatorAppointment, FormLiquidatorDetails } from '#components'
import { LiquidatorAppointmentMethod } from '#business/app/enums/liquidator-appointment-method'
import { getLiquidatorRoleMetaSchema } from './roles'

// mirrors business-schemas relationship.json: a Liquidator role requires `meta.appointmentMethod`,
// and `meta.courtOrderNumber` (a court order `fileNumber`) when appointed by the court
export function getLiquidatorAppointmentSchema() {
  const t = useNuxtApp().$i18n.t

  return getLiquidatorRoleMetaSchema().superRefine((val, ctx) => {
    if (!val.appointmentMethod) {
      ctx.addIssue({
        code: 'custom',
        path: ['appointmentMethod'],
        message: t('validation.appointmentMethodRequired')
      })
      return
    }

    if (val.appointmentMethod !== LiquidatorAppointmentMethod.COURT) {
      return
    }

    const courtOrderNumber = val.courtOrderNumber?.trim() ?? ''
    if (!courtOrderNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['courtOrderNumber'],
        message: t('validation.courtOrderNumberRequired')
      })
      return
    }

    // same court order number rules as the filing's court order (meta.courtOrderNumber refs court_order fileNumber)
    const result = getCourtOrderNumberSchema().safeParse(courtOrderNumber)
    if (!result.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['courtOrderNumber'],
        message: result.error.issues[0]!.message
      })
    }
  })
}

export type LiquidatorAppointmentSchema = z.output<ReturnType<typeof getLiquidatorAppointmentSchema>>

export type FormLiquidatorAppointmentRef = InstanceType<typeof FormLiquidatorAppointment>
export type FormLiquidatorDetailsRef = InstanceType<typeof FormLiquidatorDetails>
