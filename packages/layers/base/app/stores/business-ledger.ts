import { useQuery } from '@pinia/colada'

/** Manages business ledger data */
export const useBusinessLedgerStore = defineStore('business-ledger', () => {
  const { getBusinessLedger, handleError } = useBusinessApi()

  const ledger = ref<BusinessLedgerItem[]>([])

  const init = async (businessId: string, date?: IsoDatePacific) => {
    const { state: ledgerResp, refresh: businessRefresh } = useQuery({
      key: () => ['businessLedger', businessId, date || ''],
      query: () => getBusinessLedger(businessId, false, date)
    })
    if (ledgerResp.value.status === 'pending') {
      await businessRefresh().then(({ error }) => {
        if (error) {
          handleError(error, 'errorModal.business.ledger')
        }
      })
    }
    ledger.value = ledgerResp.value.data || []
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
