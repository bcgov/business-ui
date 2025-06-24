export default defineNuxtPlugin(() => {
  const rtc = useRuntimeConfig().public
  const legalApiUrl = rtc.legalApiUrl as string
  const appName = rtc.appName
  const xApiKey = rtc.xApiKey
  const { $keycloak } = useNuxtApp()
  const accountId = useConnectAccountStore().currentAccount.id

  const api = $fetch.create({
    baseURL: legalApiUrl,
    onRequest({ options }) {
      const headers = options.headers ||= {} as Headers
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
        headers.push(['App-Name', appName])
        headers.push(['Account-Id', accountId])
        headers.push(['X-Apikey', xApiKey])
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
        headers.set('App-Name', appName)
        headers.set('Account-Id', String(accountId))
        headers.set('X-Apikey', String(xApiKey))
      } else {
        // @ts-expect-error - 'Authorization' doesnt exist on type Headers
        headers.Authorization = `Bearer ${$keycloak.token}`
        // @ts-expect-error - 'App-Name' doesnt exist on type Headers
        headers['App-Name'] = appName
        // @ts-expect-error - 'Account-Id' doesnt exist on type Headers
        headers['Account-Id'] = accountId
        // @ts-expect-error - 'X-Apikey' doesnt exist on type Headers
        headers['X-Apikey'] = xApiKey
      }
    }
  })

  return {
    provide: {
      legalApi: api
    }
  }
})
