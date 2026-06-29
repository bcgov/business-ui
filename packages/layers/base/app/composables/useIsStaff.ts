export const useIsStaff = () => {
  const store = useConnectAccountStore()
  return computed(() => store.currentAccount?.accountType === AccountType.STAFF)
}
