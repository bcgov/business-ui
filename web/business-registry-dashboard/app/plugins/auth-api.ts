export default defineNuxtPlugin((nuxtApp) => {
  const { $authApi, $keycloak } = useNuxtApp()
  const config = useRuntimeConfig()

  // Use authApi from Axios
  const api = $fetch.create({
    ...$authApi,
    onRequest ({ options }) {
      // We need to use the GW url
      // currently the older url comes over from @daxiom/nuxt-core-layer-test
      if (config.public.authApiGwUrl) {
        options.baseURL = config.public.authApiGwUrl
      }

      const accountStore = useConnectAccountStore()
      // Set up headers
      // Should already have Authorization header and keycloak token set by authApi
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        if (config.public.authApiKey && accountStore.currentAccount?.id) {
          headers.push(['Account-Id', accountStore.currentAccount.id])
          headers.push(['X-Apikey', config.public.authApiKey as string])
        }
      } else if (headers instanceof Headers) {
        if (config.public.authApiKey && accountStore.currentAccount?.id) {
          headers.set('Account-Id', accountStore.currentAccount.id)
          headers.set('X-Apikey', config.public.authApiKey as string)
        }
      } else {
        // Catch all, we set everything here.
        const appName = config.public.appName
        headers.Authorization = `Bearer ${$keycloak.token}`
        headers['App-Name'] = appName
        if (config.public.authApiKey && accountStore.currentAccount?.id) {
          headers['Account-Id'] = accountStore.currentAccount.id
          headers['X-Apikey'] = config.public.authApiKey as string
        }
      }
    }
  })

  // Provide altered version of authApi for BRD, must be renamed to avoid conflicts.
  nuxtApp.provide('authApiBRD', api)
})
