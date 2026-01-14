export function formatCourtOrderUi(courtOrder: CourtOrder | undefined): CourtOrderPoaSchema {
  return {
    courtOrderNumber: courtOrder?.fileNumber ?? '',
    hasPoa: courtOrder?.hasPlanOfArrangement ?? false
  }
}

export function formatCourtOrderApi(courtOrder: CourtOrderPoaSchema): CourtOrder {
  return {
    fileNumber: courtOrder.courtOrderNumber ?? '',
    hasPlanOfArrangement: !!courtOrder.hasPoa
  }
}
