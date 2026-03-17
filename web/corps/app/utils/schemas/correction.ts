import { z } from 'zod'

export const CORRECTION_DETAIL_COMMENT_MAX_LENGTH = 1932

function getClientCorrectionSchema() {
  return z.object({
    certify: getCertifySchema().default({
      isCertified: false,
      legalName: ''
    }),
    folio: getFolioSchema().default({ folioNumber: '' })
  })
}

function getStaffCorrectionSchema() {
  return z.object({
    courtOrder: getCourtOrderPoaSchema().default(() => ({
      hasPoa: false,
      courtOrderNumber: ''
    })),
    staffPayment: getStaffPaymentSchema().default(() => ({
      option: StaffPaymentOption.NONE,
      bcolAccountNumber: '',
      datNumber: '',
      routingSlipNumber: '',
      folioNumber: '',
      isPriority: false
    }))
  })
}

export function getCorrectionSchema(isStaff: boolean) {
  const schema = z.object({
    comment: getDetailSchema(CORRECTION_DETAIL_COMMENT_MAX_LENGTH).default({ detail: '' }),
    documentDelivery: getDocumentDeliverySchema().default(() => ({ completingPartyEmail: '' })),
    activeDirector: getActivePartySchema(),
    activeReceiver: getActivePartySchema(RoleTypeUi.RECEIVER),
    activeLiquidator: getActivePartySchema(RoleTypeUi.LIQUIDATOR),
    activeOffice: getActiveOfficesSchema(),
    activeClass: getActiveShareClassSchema(),
    activeSeries: getActiveShareSeriesSchema()
  })

  if (isStaff) {
    return schema.extend(getStaffCorrectionSchema().shape)
  } else {
    return schema.extend(getClientCorrectionSchema().shape)
  }
}

export type CorrectionFormSchema = Partial<
  z.output<ReturnType<typeof getStaffCorrectionSchema>>
  & z.output<ReturnType<typeof getClientCorrectionSchema>>
  & z.output<ReturnType<typeof getCorrectionSchema>>
>
