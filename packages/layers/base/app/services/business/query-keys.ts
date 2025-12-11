export const useBusinessQueryKeys = () => {
  const accountStore = useConnectAccountStore()
  const { currentAccount } = storeToRefs(accountStore)

  function getBusinessKey(businessId: string, slim: boolean) {
    return ['business', businessId, slim, currentAccount.value.id] as const
  }

  return {
    getBusinessKey
  }
}
