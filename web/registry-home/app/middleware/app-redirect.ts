export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig().public
  const localePath = useLocalePath()

  if (from.path === '/') {
    // is a routing rule redirect (will lose the 'to' will have lost the query params)
    to.query = from.query
  }
  // FUTURE: Temporary fallback until the new BRH home page exists—migration flows
  // use ?token= to enter extended auth, but non-migration traffic is routed to BRD for now.
  if (to.query?.token) {
    // FUTURE: ticket number - update in magic auth link after email ticket is done
    to.query.return = config.brdUrl + 'affiliationInvitation/token'
    return navigateTo({ path: localePath('/auth/account/select'), query: to.query })
  } else {
    return navigateTo(
      {
        path: appendUrlParam(
          config.brdUrl,
          'accountid',
          useConnectAccountStore().currentAccount?.id
        )
      },
      { external: true }
    )
  }
})
