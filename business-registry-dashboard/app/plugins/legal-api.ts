export default defineNuxtPlugin(() => {
  const legalApiUrl = useRuntimeConfig().public.legalApiUrl
  const { $keycloak } = useNuxtApp()

  const api = $fetch.create({
    baseURL: legalApiUrl,
    onRequest ({ options }) {
      const headers = options.headers ||= {}
      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${$keycloak.token}`])
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${$keycloak.token}`)
      } else {
        headers.Authorization = `Bearer ${$keycloak.token}`
      }
    }
  })

  return {
    provide: {
      legalApi: api
    }
  }
})
