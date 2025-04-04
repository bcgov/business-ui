export default defineNuxtPlugin(() => {
  const legalApiUrl = useRuntimeConfig().public.legalApiUrl as string
  const { $keycloak } = useNuxtApp()
  const appName = useRuntimeConfig().public.appName

  const api = $fetch.create({
    baseURL: legalApiUrl,
    onRequest({ options }) {
      const headers = options.headers ||= {} as Headers
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
        headers.push(['App-Name', appName])
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
        headers.set('App-Name', appName)
      } else {
        // @ts-expect-error - 'Authorization' doesnt exist on type Headers
        headers.Authorization = `Bearer ${$keycloak.token}`
        // @ts-expect-error - 'App-Name' doesnt exist on type Headers
        headers['App-Name'] = appName
      }
    }
  })

  return {
    provide: {
      legalApi: api
    }
  }
})
