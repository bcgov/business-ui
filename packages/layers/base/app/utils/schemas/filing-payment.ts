import type { z } from 'zod'

/** The staff payment a filing form starts from - no payment option selected yet. */
export function getDefaultStaffPayment(): StaffPaymentSchema {
  return {
    option: StaffPaymentOption.NONE,
    bcolAccountNumber: '',
    datNumber: '',
    routingSlipNumber: '',
    folioNumber: '',
    isPriority: false
  }
}

export function getStaffPaymentSectionShape() {
  return { staffPayment: getStaffPaymentSchema().default(getDefaultStaffPayment) }
}

export function getFolioSectionShape() {
  return { folio: getFolioSchema().default(() => ({ folioNumber: '' })) }
}

/**
 * Adds the payment section to a filing form schema: staff file with a staff payment, clients
 * with a folio number - never both.
 */
export function withPaymentSection<S extends z.ZodObject<z.ZodRawShape>>(base: S, isStaff: boolean) {
  if (isStaff) {
    return base.extend(getStaffPaymentSectionShape())
  }

  return base.extend(getFolioSectionShape())
}

/** The form state type for a schema built with `withPaymentSection` - only one section is ever present. */
export type WithPaymentSections<S extends z.ZodObject<z.ZodRawShape>> = Partial<
  z.output<S>
  & { staffPayment: StaffPaymentSchema, folio: FolioSchema }
>
