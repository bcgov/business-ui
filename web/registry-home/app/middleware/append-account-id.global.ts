// FUTURE: remove once select account is updated in the connect auth layer
export default defineNuxtRouteMiddleware((to) => {
  const { currentAccount } = useConnectAccountStore()
  if (currentAccount?.id) {
    to.query.accountid = String(currentAccount.id)
  }
})
