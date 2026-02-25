export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()

  const accountStore = useConnectAccountStore()
  if (to.query.accountid) {
    // FUTURE: can remove this after this UI is upgraded to use @sbc-connect layers instead of @daxiom/nuxt-core-layer-test
    accountStore.switchCurrentAccount(to.query.accountid as string)
  }

  // If accountid and populate are in the query params, redirect to /account/<id>
  if (to.query.accountid && to.query.populate) {
    // Pull accountid out, keep the rest of the query params
    const { accountid, ...restQuery } = to.query

    return navigateTo(
      {
        path: localePath(`/account/${accountid}`),
        query: { ...restQuery }
      },
      { replace: true }
    )
  }
})
