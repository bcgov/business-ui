/** Manages staff payment data */
export const useStaffPaymentStore = defineStore('staff-payment', () => {
  const getEmptyStaffPayment = (): StaffPayment => ({
    bcolAccountNumber: '',
    datNumber: '',
    folioNumber: '',
    isPriority: false,
    option: StaffPaymentOption.NONE,
    routingSlipNumber: ''
  })

  const staffPayment = ref<StaffPayment>(getEmptyStaffPayment())

  const $reset = () => {
    staffPayment.value = getEmptyStaffPayment()
  }

  return {
    getEmptyStaffPayment,
    staffPayment,
    $reset
  }
})
