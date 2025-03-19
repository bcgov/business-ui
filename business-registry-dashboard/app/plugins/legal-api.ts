export default defineNuxtPlugin(() => {
  const legalApiUrl = useRuntimeConfig().public.legalApiUrl
  const { $keycloak } = useNuxtApp()
  const appName = useRuntimeConfig().public.appName

  const api = $fetch.create({
    baseURL: legalApiUrl,
    onRequest ({ options }) {
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
        headers.push(['App-Name', appName])
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
        headers.set('App-Name', appName)
      } else {
        headers.Authorization = `Bearer ${$keycloak.token}`
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
