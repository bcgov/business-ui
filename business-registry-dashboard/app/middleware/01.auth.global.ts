export default defineNuxtRouteMiddleware((to) => {
  console.log('to', to)
  console.log('Route meta:', to.meta)
  console.log('Route params:', to.params)
  console.log('Authentication status:', useNuxtApp().$keycloak.authenticated)

  if (process.client) {
    const { $keycloak } = useNuxtApp()
    const localePath = useLocalePath()
    if (to.meta.order !== 0 && !$keycloak.authenticated) {
      return navigateTo(localePath('/'))
    }
  }
})
