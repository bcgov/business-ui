export default defineNuxtPlugin(() => {
  const authApiUrl = useRuntimeConfig().public.authApiURL
  const { $keycloak } = useNuxtApp()

  const api = $fetch.create({
    baseURL: authApiUrl,
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
      authApi: api
    }
  }
})
