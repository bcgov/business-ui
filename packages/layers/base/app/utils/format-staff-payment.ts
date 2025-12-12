export function formatStaffPaymentUi(header: FilingHeaderResponse): StaffPaymentSchema {
  return {
    bcolAccountNumber: header.bcolAccountNumber ?? '',
    datNumber: header.datNumber ?? '',
    folioNumber: header.folioNumber ?? '',
    isPriority: !!header.priority,
    option: header.staffPaymentOption ?? StaffPaymentOption.NONE,
    routingSlipNumber: header.routingSlipNumber ?? ''
  }
}

export function formatStaffPaymentApi(staffPayment: StaffPaymentSchema): Partial<FilingHeaderResponse> {
  if (staffPayment.option === StaffPaymentOption.NONE) {
    return {}
  }
  // Only return values that have data
  const waiveFees = staffPayment.option === StaffPaymentOption.NO_FEE
  return {
    staffPaymentOption: staffPayment.option,
    waiveFees,
    ...(staffPayment.bcolAccountNumber ? { bcolAccountNumber: staffPayment.bcolAccountNumber } : {}),
    ...(staffPayment.datNumber ? { datNumber: staffPayment.datNumber } : {}),
    ...(staffPayment.folioNumber ? { folioNumber: staffPayment.folioNumber } : {}),
    ...(staffPayment.isPriority ? { priority: staffPayment.isPriority } : {}),
    ...(staffPayment.routingSlipNumber ? { routingSlipNumber: staffPayment.routingSlipNumber } : {})
  }
}
