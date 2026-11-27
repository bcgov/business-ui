/** Sets the registry home > business registry > business crumbs for the current business route. */
export const useDashboardBreadcrumbs = () => {
  const route = useRoute()
  const businessStore = useBusinessStore()
  const { breadcrumbs: filingBreadcrumbs } = useFilingNavigation()

  const businessId = route.params.businessId as string

  watchEffect(() => {
    setBreadcrumbs([
      ...filingBreadcrumbs.value.slice(0, 2),
      { label: businessStore.businessName || businessId }
    ])
  })
}
