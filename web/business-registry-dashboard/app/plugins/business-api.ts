export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { $keycloak } = useNuxtApp()
  const appName = config.public.appName

  const api = $fetch.create({
    onRequest ({ options }) {
      const accountId = useConnectAccountStore().currentAccount.id

      // Set the baseURL
      options.baseURL = config.public.businessApiGwUrl

      // Set up headers
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
        headers.push(['App-Name', appName])
        if (config.public.businessApiKey) {
          headers.push(['Account-Id', accountId])
          headers.push(['X-Apikey', config.public.businessApiKey])
        }
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
        headers.set('App-Name', appName)
        if (config.public.businessApiKey) {
          headers.set('Account-Id', accountId)
          headers.set('X-Apikey', config.public.businessApiKey)
        }
      } else {
        headers.Authorization = `Bearer ${$keycloak.token}`
        headers['App-Name'] = appName
        if (config.public.businessApiKey) {
          headers['Account-Id'] = accountId
          headers['X-Apikey'] = config.public.businessApiKey
        }
      }
    }
  })

  return {
    provide: {
      businessApi: api
    }
  }
})
