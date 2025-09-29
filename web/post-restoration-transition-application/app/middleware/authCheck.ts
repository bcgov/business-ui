export default defineNuxtRouteMiddleware(async () => {
  const { $keycloak, $config } = useNuxtApp()
  if ($config.public.playwright) {
    $keycloak.tokenParsed = {
      firstname: 'TestFirst',
      lastname: 'TestLast',
      name: 'TestFirst TestLast',
      username: 'testUsername',
      email: 'testEmail@test.com',
      sub: 'test',
      loginSource: 'IDIR',
      realm_access: { roles: ['public_user'] }
    }

    // set account stuff (normally would happen after kc init in 'setupAuth')
    const account = useConnectAccountStore()
    const { currentAccount, userAccounts } = storeToRefs(account)
    const resp = await account.getUserAccounts('test')
    if (resp && resp[0]) {
      Object.assign(currentAccount.value, resp[0])
      Object.assign(userAccounts.value, resp)
      $keycloak.authenticated = true
    }
  } else if (!$keycloak.authenticated) {
    const returnUrl = encodeURIComponent(window.location.href)
    return navigateTo(
      `${$config.public.registryHomeUrl}login?return=${returnUrl}`,
      { external: true }
    )
  }
})
