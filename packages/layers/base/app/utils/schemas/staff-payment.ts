import type { StaffPayment } from '#components'
import { z } from 'zod'

export function getStaffPaymentSchema() {
  const t = useNuxtApp().$i18n.t
  const validStaffSelection = [StaffPaymentOption.BCOL, StaffPaymentOption.FAS, StaffPaymentOption.NO_FEE]
  const folioSchema = getFolioSchema()
  return z.object({
    option: z.enum(StaffPaymentOption).refine(
      v => validStaffSelection.includes(v), { error: t('validation.selectAPaymentOption') }),
    bcolAccountNumber: z.string(),
    datNumber: z.string(),
    isPriority: z.boolean().optional(),
    routingSlipNumber: z.string(),
    ...folioSchema.shape
  }).superRefine((val, ctx) => {
    switch (val.option) {
      case StaffPaymentOption.BCOL:
        if (!val.bcolAccountNumber.length) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.bcolAccountNumberEmpty'),
            path: ['bcolAccountNumber']
          })
        } else if (!/^\d{6}$/.test(val.bcolAccountNumber)) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.bcolAccountNumber'),
            path: ['bcolAccountNumber']
          })
        }
        if (!val.datNumber) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.datNumberEmpty'),
            path: ['datNumber']
          })
        } else if (!/^[A-Z]{1}[0-9]{7,9}$/.test(val.datNumber)) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.datNumber'),
            path: ['datNumber']
          })
        }
        break
      case StaffPaymentOption.FAS:
        if (!val.routingSlipNumber) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.routingSlipNumberEmpty'),
            path: ['routingSlipNumber']
          })
        } else if (!/^\d{9}$/.test(val.routingSlipNumber)) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.routingSlipNumber'),
            path: ['routingSlipNumber']
          })
        }
    }
  })
}

export type StaffPaymentSchema = z.output<ReturnType<typeof getStaffPaymentSchema>>

export type StaffPaymentFormRef = InstanceType<typeof StaffPayment>
