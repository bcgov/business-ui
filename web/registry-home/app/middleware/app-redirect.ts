export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig().public

  // ToDo: Can remove this middleware once BRH is setup
  return navigateTo(
    {
      path: appendUrlParam(
        config.brdHomeUrl,
        'accountid',
        useConnectAccountStore().currentAccount.id
      )
    },
    { external: true }
  )
})
