export const useFilingNavigation = (filingLabel?: string) => {
  const t = useNuxtApp().$i18n.t
  const route = useRoute()
  const rtc = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const businessStore = useBusinessStore()

  const businessId = route.params.businessId as string

  const isDraft = computed(() => route.query.draft !== undefined)
  const isStaff = useIsStaff()

  const dashboardUrl = computed(() =>
    `${rtc.businessDashboardUrl}${businessId}?accountid=${accountStore.currentAccount.id}`
  )

  const registryHome = computed(() => {
    const url = isStaff.value ? `${rtc.authWebUrl}staff/dashboard/active` : `${rtc.registryHomeUrl}dashboard`
    const label = isStaff.value ? t('label.staffDashboard') : t('label.bcRegistriesDashboard')

    return { url, label }
  })

  const breadcrumbs = computed(() => [
    {
      label: registryHome.value.label,
      to: registryHome.value.url,
      external: true,
      appendAccountId: true
    },
    {
      label: isStaff.value ? t('label.myStaffBusinessRegistry') : t('label.myBusinessRegistry'),
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
