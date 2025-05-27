// TODO: add this as store method in core layer

/**
 * Checks if the given account ID matches the ID of the current account in the store.
 *
 * @param {number} accountId - The account ID to check.
 * @returns {boolean} True if the given account ID matches the current account ID, false otherwise.
 */
export const isCurrentOrganization = (accountId: number) => {
  const accountStore = useConnectAccountStore()
  return accountId === Number(accountStore.currentAccount.id)
}
