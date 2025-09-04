import type { $Fetch } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const rtc = nuxtApp.$config.public
  const businessApiUrl = rtc.businessApiUrl + rtc.businessApiVersion
  const appName = rtc.appName
  const xApiKey = rtc.xApiKey

  // $fetch not being recognized
  const api = ($fetch as $Fetch).create({
    baseURL: businessApiUrl,
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
      businessApi: api
    }
  }
})
