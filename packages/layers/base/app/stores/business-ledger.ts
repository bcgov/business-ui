/** Manages business ledger data */
export const useBusinessLedgerStore = defineStore('business-ledger', () => {
  const { getBusinessLedger } = useBusinessApi()

  const ledger = ref<BusinessLedgerItem[]>([])
  const cacheKey = ref('')

  const init = async (businessId: string, date?: IsoDatePacific) => {
    const key = businessId + (date || '')
    if (cacheKey.value !== key) {
      ledger.value = await getBusinessLedger(businessId, false, date) || []
      cacheKey.value = key
    }
  }

  const $reset = () => {
    ledger.value = []
  }

  return {
    ledger,
    init,
    $reset
  }
})
