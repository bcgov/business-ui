/**
 * Business Registry Dashboard - Auth API Plugin
 * Short term extension of authApi plugin from @daxiom/nuxt-core-layer-test
 * to provide additional headers and use the authApiGwUrl.
 *
 * This should be removed once we upgrade from @daxiom/nuxt-core-layer-test
 * to the new nuxt layer setup that supports these features.
 */

export default defineNuxtPlugin((nuxtApp) => {
  const { $authApi, $keycloak } = useNuxtApp()
  const config = useRuntimeConfig()
  const gwUrl = config.public.authApiGwUrl
  const apiKey = config.public.authApiKey
  const appName = config.public.appName
  // Use authApi from Axios
  const api = $fetch.create({
    ...$authApi,
    onRequest ({ options }) {
      // We need to use the GW url
      // currently the older url comes over from @daxiom/nuxt-core-layer-test
      if (gwUrl) {
        options.baseURL = gwUrl
      }
      const accountStore = useConnectAccountStore()
      const accountId = accountStore.currentAccount?.id

      // Set up headers
      // Should already have Authorization header and keycloak token set by authApi
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        if (apiKey && accountId) {
          headers.push(['Account-Id', accountId])
          headers.push(['X-Apikey', apiKey as string])
        }
      } else if (headers instanceof Headers) {
        if (apiKey && accountId) {
          headers.set('Account-Id', accountId)
          headers.set('X-Apikey', apiKey as string)
        }
      } else {
        // Catch all, we set everything here.
        headers.Authorization = `Bearer ${$keycloak.token}`
        headers['App-Name'] = appName
        if (apiKey && accountId) {
          headers['Account-Id'] = accountId
          headers['X-Apikey'] = apiKey as string
        }
      }
    }
  })

  // Provide altered version of authApi for BRD, must be renamed to avoid conflicts.
  nuxtApp.provide('authApiBRD', api)
})
