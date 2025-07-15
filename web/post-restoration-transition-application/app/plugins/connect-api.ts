export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { $keycloak } = useNuxtApp()
  const appName = config.public.appName

  const api = $fetch.create({
    onRequest ({ options }) {
      options.baseURL = config.public.connectApiUrl
      const apiKey = config.public.connectApiKey

      const accountStore = useConnectAccountStore()
      // Set up headers
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
        headers.push(['App-Name', appName])
        headers.push(['Account-Id', accountStore.currentAccount.id])
        headers.push(['X-Apikey', apiKey])
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
        headers.set('App-Name', appName)
        headers.set('Account-Id', accountStore.currentAccount.id)
        headers.set('X-Apikey', apiKey)
      } else {
        headers.Authorization = `Bearer ${$keycloak.token}`
        headers['App-Name'] = appName
        headers['Account-Id'] = accountStore.currentAccount.id
        headers['X-Apikey'] = apiKey
      }
    }
  })

  return {
    provide: {
      connectApi: api
    }
  }
})
