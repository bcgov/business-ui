export const useFilingNavigation = (filingLabel?: string) => {
  const t = useNuxtApp().$i18n.t
  const route = useRoute()
  const rtc = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const businessStore = useBusinessStore()

  const businessId = route.params.businessId as string

  const isDraft = computed(() => route.query.draft !== undefined)

  const dashboardUrl = computed(() =>
    `${rtc.businessDashboardUrl}${businessId}?accountid=${accountStore.currentAccount.id}`
  )

  const breadcrumbs = computed(() => [
    {
      label: t('label.bcRegistriesDashboard'),
      to: `${rtc.registryHomeUrl}dashboard`,
      external: true,
      appendAccountId: true
    },
    {
      label: t('label.myBusinessRegistry'),
      to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}`,
      external: true
    },
    {
      label: businessStore.business?.legalName,
      to: dashboardUrl.value,
      external: true
    },
    {
      label: filingLabel
    }
  ])

  return {
    isDraft,
    dashboardUrl,
    breadcrumbs
  }
}
