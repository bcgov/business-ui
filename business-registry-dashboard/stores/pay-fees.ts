import { v4 as UUIDv4 } from 'uuid'
import payApi from '~/services/pay-api'
export const usePayFeesStore = defineStore('bar-sbc-pay-fees', () => {
  const fees: Ref<PayFeesWidgetItem[]> = ref([])
  const folioNumber = ref('')
  const feeInfo: Ref<[FeeData, FeeInfo][]> = ref([])

  function addFee (newFee: FeeInfo) {
    const fee = fees.value.find((fee: PayFeesWidgetItem) => // check if fee already exists
      fee.filingType === newFee.filingType && fee.filingTypeCode === newFee.filingTypeCode
    )

    if (fee) {
      if (fee.quantity === undefined) {
        fee.quantity = 1 // set quantity to 1 if fee exists but has no quantity
      } else {
        fee.quantity += 1 // increase quantity if it already exists
      }
    } else { // validate fee doesnt have null values
      if (!newFee || newFee.total == null || newFee.filingFees == null || newFee.filingTypeCode == null) {
        console.error('Trying to add INVALID FEE; Fee is missing details. Fee:', newFee)
        return
      }
      fees.value.push({ ...newFee, quantity: 1, uiUuid: UUIDv4() }) // add fee if valid
    }
  }

  function removeFee (feeToRemove: FeeInfo) {
    const fee = fees.value.find((fee: PayFeesWidgetItem) => // check if fee exists
      fee.filingType === feeToRemove.filingType && fee.filingTypeCode === feeToRemove.filingTypeCode
    )

    if (fee?.quantity && fee.quantity > 1) { // decrease quantity if fee exists and greater than 1
      fee.quantity -= 1
    } else { // remove fee if fee quantity <= 1
      const index = fees.value.findIndex((fee: PayFeesWidgetItem) =>
        fee.filingType === feeToRemove.filingType && fee.filingTypeCode === feeToRemove.filingTypeCode
      )
      if (index > -1) {
        fees.value.splice(index, 1)
      }
    }
  }

  async function loadFeeTypesAndCharges (newFolioNumber: string, filingData: FeeData[]) {
    folioNumber.value = newFolioNumber

    // fetch fee info for each fee and add to feeInfo array
    for (const filingDataItem of filingData) {
      const fee = await payApi.fetchFee(filingDataItem)
      if (fee) {
        feeInfo.value.push([filingDataItem, fee])
      }
    }
  }

  async function getFeeInfo (searchFilingData: FeeData, tryLoadIfNotCached: boolean = true): Promise<FeeInfo | undefined> {
    const feeInfoItem = feeInfo.value.find( // check if fee info already exists
      ([filingData, _]) =>
        filingData.entityType === searchFilingData.entityType &&
        filingData.filingTypeCode === searchFilingData.filingTypeCode
    )

    if (feeInfoItem) { // if fee already exists, return fee
      return feeInfoItem[1]
    } else if (!feeInfoItem && tryLoadIfNotCached) { // if no existing fee, load fees then return feeInfoItem
      await loadFeeTypesAndCharges(folioNumber.value, [searchFilingData])
      return getFeeInfo(searchFilingData, false)
    }
    return undefined // return undefined if no fee found and tryLoadIfNotCached = false
  }

  // load fee info and add to fees array
  async function addPayFees (feeCode: string): Promise<void> {
    try {
      const fee = payApi.feeType[feeCode]
      const feeInfo = await getFeeInfo(fee)

      if (feeInfo) {
        addFee(feeInfo)
      }
    } catch {
      const alertStore = useAlertStore()
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.FEE_INFO
      })
    }
  }

  function $reset () {
    fees.value = []
    folioNumber.value = ''
    feeInfo.value = []
  }

  return {
    fees,
    folioNumber,
    feeInfo,
    loadFeeTypesAndCharges,
    addFee,
    removeFee,
    getFeeInfo,
    addPayFees,
    $reset
  }
}
)
