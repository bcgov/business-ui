// navigate to AR page if a filing exists
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) { return }
  const arStore = useAnnualReportStore()
  const localePath = useLocalePath()
  if (Object.keys(arStore.arFiling).length !== 0) {
    return navigateTo(localePath('/annual-report'))
  }
})
