export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig().public
  const localePath = useLocalePath()

  // ToDo: Can remove this middleware once BRH is setup
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
