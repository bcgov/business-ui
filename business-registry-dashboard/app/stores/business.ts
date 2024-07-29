export const useBusinessStore = defineStore('bar-sbc-business-store', () => {
  const alertStore = useAlertStore()

  // store values
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)
  const fullDetails = ref<Business>({} as Business)
  const businessNano = ref<BusinessNano>({} as BusinessNano)
  const nextArDate = ref<string>('')
  const payStatus = ref<string | null>(null)

  function $reset () {
    loading.value = true
    currentBusiness.value = {} as BusinessFull
    businessNano.value = {} as BusinessNano
    nextArDate.value = ''
    payStatus.value = null
    fullDetails.value = {} as Business
  }

  return {
    $reset,
    loading,
    currentBusiness,
    businessNano,
    nextArDate,
    payStatus,
    fullDetails
  }
},
{ persist: true } // persist store values in session storage
)
