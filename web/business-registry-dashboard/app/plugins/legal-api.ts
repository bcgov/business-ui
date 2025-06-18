export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { $keycloak } = useNuxtApp()
  const appName = config.public.appName

  const api = $fetch.create({
    onRequest ({ options }) {
      // Default to legal API URL
      let baseURL = config.public.legalApiUrl
      let useBusinessApiKey = false

      // Check feature flag to determine which API to use
      try {
        const ldStore = useConnectLaunchdarklyStore()
        if (ldStore.ldInitialized && ldStore.getStoredFlag(LDFlags.UseBusinessApiGwUrl)) {
          baseURL = config.public.businessApiGwUrl
          useBusinessApiKey = true
        }
      } catch (error) {
        // LaunchDarkly not ready or error accessing store, use default legal API
        console.error('LaunchDarkly not available, using Legal API:', baseURL)
      }

      // Set the baseURL dynamically
      options.baseURL = baseURL

      const accountStore = useConnectAccountStore()
      // Set up headers
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
        headers.push(['App-Name', appName])
        if (useBusinessApiKey && config.public.businessApiKey) {
          headers.push(['Account-Id', accountStore.currentAccount.id])
          headers.push(['X-Apikey', config.public.businessApiKey as string])
        }
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
        headers.set('App-Name', appName)
        if (useBusinessApiKey && config.public.businessApiKey) {
          headers.set('Account-Id', accountStore.currentAccount.id)
          headers.set('X-Apikey', config.public.businessApiKey as string)
        }
      } else {
        headers.Authorization = `Bearer ${$keycloak.token}`
        headers['App-Name'] = appName
        if (useBusinessApiKey && config.public.businessApiKey) {
          headers['Account-Id'] = accountStore.currentAccount.id
          headers['X-Apikey'] = config.public.businessApiKey as string
        }
      }
    }
  })

  return {
    provide: {
      legalApi: api
    }
  }
})
