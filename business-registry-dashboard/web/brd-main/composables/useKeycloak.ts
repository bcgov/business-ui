export const useKeycloak = () => {
  const { $keycloak, $i18n } = useNuxtApp()
  const locale = ref($i18n.locale.value)

  function login () {
    return $keycloak.login(
      {
        idpHint: 'bcsc',
        redirectUri: `${location.origin}/${locale.value}`
      }
    )
  }

  function logout () {
    // clear pinia stores on logout
    resetPiniaStores()

    return $keycloak.logout({
      redirectUri: `${location.origin}/${locale.value}`
    })
  }

  // not currently needed
  // async function getUserProfile () {
  //   if ($keycloak && $keycloak.authenticated) {
  //     return await $keycloak.loadUserProfile()
  //   } else {
  //     return null
  //   }
  // }

  function isAuthenticated () {
    if (!$keycloak) {
      return false
    }
    return $keycloak.authenticated
  }

  const kcUser = computed((): KCUser => {
    if ($keycloak && $keycloak.tokenParsed) {
      return {
        firstName: $keycloak.tokenParsed.firstname,
        lastName: $keycloak.tokenParsed.lastname,
        fullName: $keycloak.tokenParsed.name,
        userName: $keycloak.tokenParsed.username,
        email: $keycloak.tokenParsed.email,
        keycloakGuid: $keycloak.tokenParsed.sub || '',
        loginSource: $keycloak.tokenParsed.loginSource,
        roles: $keycloak.tokenParsed.realm_access?.roles || []
      }
    }
    return {} as KCUser
  })

  async function getToken (forceRefresh = false): Promise<string | undefined> {
    const minValidity = forceRefresh ? -1 : 30
    return await $keycloak
      .updateToken(minValidity)
      .then((_refreshed) => {
        return $keycloak.token
      })
      .catch((error) => {
        console.error(`Failed to get session token: ${error}`)
        return undefined
      })
  }

  return {
    login,
    logout,
    getToken,
    // getUserProfile,
    isAuthenticated,
    kcUser
  }
}
