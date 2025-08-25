import * as z from 'zod'

export const STAFF_PAY_PAYMENT_METHODS = ['cash', 'bconline', 'none']

const message = 'errors.maxLength30'

const refine = (input, ctx) => {
  if (input.paymentMethod === STAFF_PAY_PAYMENT_METHODS[0]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['routingSlipNumber'],
      message: 'errors.required'
    })
  } else if (input.paymentMethod === STAFF_PAY_PAYMENT_METHODS[1]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['bcOnlineAccountNumber'],
      message: 'errors.required'
    })
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['datNumber'],
      message: 'errors.required'
    })
  }
}

export interface StaffPay {
    paymentMethod: string
    routingSlipNumber: string
    bcOnlineAccountNumber: string
    datNumber: string
    folioNumber: string
    priority: boolean
}

export const StaffPaySchema = z.object({
    paymentMethod: z.string().min(1, 'errors.required'),
    routingSlipNumber: z.string().optional(),
    bcOnlineAccountNumber: z.string().optional(),
    datNumber: z.string().optional(),
    folioNumber: z.string().max(MAX_FOLIO_REF_LENGTH, message).optional(),
    priority: z.boolean()
}).superRefine(refine)
