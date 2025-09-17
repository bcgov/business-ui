export const useOfficerNavigation = () => {
  const t = useNuxtApp().$i18n.t
  const route = useRoute()
  const rtc = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const officerStore = useOfficerStore()

  const businessId = route.params.businessId as string

  const isDraft = computed(() => route.query.draft !== undefined)

  const dashboardUrl = computed(() =>
    `${rtc.businessDashboardUrl}${businessId}?accountid=${accountStore.currentAccount.id}`
  )

  const editUrl = computed(() =>
    `${rtc.businessEditUrl}${businessId}/alteration?accountid=${accountStore.currentAccount.id}`
  )

  const dashboardOrEditUrl = computed(() => isDraft.value ? dashboardUrl.value : editUrl.value)

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
      label: isDraft.value
        ? officerStore.activeBusiness.legalName
        : t('label.companyInformationPage'),
      to: dashboardOrEditUrl.value,
      external: true
    },
    {
      label: t('page.officerChange.h1')
    }
  ])

  return {
    isDraft,
    dashboardUrl,
    editUrl,
    dashboardOrEditUrl,
    breadcrumbs
  }
}
