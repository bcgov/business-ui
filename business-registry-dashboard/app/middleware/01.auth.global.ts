export default defineNuxtRouteMiddleware((to) => {
  if (to.path.includes('/affiliationInvitation/acceptToken')) {
    window.location.replace(window.location.href)
    return
  }

  if (process.client) {
    const { $keycloak } = useNuxtApp()
    const localePath = useLocalePath()
    if (to.meta.order !== 0 && !$keycloak.authenticated) {
      return navigateTo(localePath('/'))
    }
  }
})
