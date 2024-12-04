export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const { $keycloak } = useNuxtApp()
    const localePath = useLocalePath()
    if (to.meta.order !== 0 && !$keycloak.authenticated) {
      return navigateTo(localePath('/'))
    }
  }
})
