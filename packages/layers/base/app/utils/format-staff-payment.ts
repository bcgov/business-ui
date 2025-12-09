export function formatStaffPaymentUi(header: FilingHeaderResponse): StaffPaymentSchema {
  return {
    bcolAccountNumber: header.bcolAccountNumber ?? '',
    datNumber: header.datNumber ?? '',
    folioNumber: header.folioNumber ?? '',
    isPriority: !!header.isPriority,
    option: header.option ?? StaffPaymentOption.NONE,
    routingSlipNumber: header.routingSlipNumber ?? ''
  }
}
