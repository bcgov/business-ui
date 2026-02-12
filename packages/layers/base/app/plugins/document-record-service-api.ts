import type { $Fetch } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const rtc = nuxtApp.$config.public
  const appName = rtc.appName
  const xApiKey = rtc.docApiKey
  const baseURL = rtc.docApiUrl + rtc.docApiVersion

  // Create $fetch instance with automatic interceptors for auth headers
  // Supports all HTTP methods (GET, POST, PUT, DELETE, etc.) in options
  const api = ($fetch as $Fetch).create({
    baseURL,
    async onRequest({ options }) {
      const auth = useConnectAuth()
      const accountStore = useConnectAccountStore()

      const token = await auth.getToken()
      const accountId = accountStore.currentAccount.id

      options.headers.set('Authorization', `Bearer ${token}`)
      options.headers.set('App-Name', appName)
      options.headers.set('X-Apikey', xApiKey)
      options.headers.set('Account-Id', String(accountId))
    }
  })

  return {
    provide: {
      documentRecordServiceApi: api
    }
  }
})
