export default defineNuxtRouteMiddleware((to) => {
  console.log('to', to)
  console.log('Route meta:', to.meta)
  console.log('Route params:', to.params)

  // if (process.client) {
  //   const { $keycloak } = useNuxtApp()
  //   const localePath = useLocalePath()
  //   if (to.meta.order !== 0 && !$keycloak.authenticated) {
  //     return navigateTo(localePath('/'))
  //   }
  // }
})
