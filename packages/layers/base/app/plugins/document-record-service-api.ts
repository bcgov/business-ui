import type { $Fetch } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const rtc = nuxtApp.$config.public
  const appName = rtc.appName
  const xApiKey = rtc.docApiKey
  const baseURL = rtc.docApiUrl + rtc.docApiVersion

  // $fetch not being recognized
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

  // Wrap api to include status without breaking existing usage
  const apiWithStatus = async <T>(url: string, opts?: any) => {
    const response = await api.raw<T>(url, opts)
    // Merge status into the data object so pre-existing code still works
    return Object.assign(
      response._data as Record<string, unknown>,
      { status: response.status }
    ) as T & { status: number }
  }

  return {
    provide: {
      documentRecordServiceApi: apiWithStatus
    }
  }
})
