export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig().public
  const localePath = useLocalePath()

  // FUTURE: Temporary fallback until the new BRH home page exists—migration flows
  // use ?populate= to enter extended auth, but non-migration traffic is routed to BRD for now.
  if (to.query?.populate) {
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
