<script setup lang="ts">
const { t } = useI18n()

const rtc = useRuntimeConfig().public
const accountStore = useConnectAccountStore()
const ptraStore = usePostRestorationTransitionApplicationStore()

useHead({
  title: t('page.postRestorationTransitionApplication.title')
})

const route = useRoute()

definePageMeta({
  layout: 'form',
  middleware: () => {
    // redirect to reg home with return url if user unauthenticated
    const { $keycloak, $config } = useNuxtApp()
    if (!$keycloak.authenticated) {
      const returnUrl = encodeURIComponent(window.location.href)
      return navigateTo(
        `${$config.public.registryHomeUrl}login?return=${returnUrl}`,
        { external: true }
      )
    }
  }
})

const businessId = route.params.businessId as string

const businessName = computed(() => {
  const alternateName = ptraStore.activeBusiness?.alternateNames?.length > 0
    ? ptraStore.activeBusiness?.alternateNames[0]?.name
    : t('label.noName')

  return ptraStore.activeBusiness?.legalName || alternateName || t('label.noName')
})

const updateBreadcrumbs = () => {
  setBreadcrumbs([
    {
      label: t('label.bcRegistriesDashboard'),
      to: `${rtc.registryHomeUrl}dashboard`,
      external: true
    },
    {
      label: t('label.myBusinessRegistry'),
      to: `${rtc.brdUrl}account/${businessId}`,
      appendAccountId: true,
      external: true
    },
    {
      label: businessName.value,
      to: `${rtc.businessDashboardUrl + businessId}`,
      appendAccountId: true,
      external: true
    },
    {
      label: t('page.postRestorationTransitionApplication.h1')
    }
  ])
}

const postRestorationTransitionApplicationStore = usePostRestorationTransitionApplicationStore()
postRestorationTransitionApplicationStore.init(businessId)

const feeStore = useConnectFeeStore()
feeStore.feeOptions.showServiceFees = true
feeStore.fees = {
  OFFICER_CHANGE: {
    filingFees: 10,
    filingType: 'Officer change fee',
    filingTypeCode: 'OFFICER_CHANGE',
    futureEffectiveFees: 0,
    priorityFees: 0,
    processingFees: 0,
    serviceFees: 0,
    tax: {
      gst: 0,
      pst: 0
    },
    total: 0,
    waived: true
  }
}

watch(businessName, () => {
  updateBreadcrumbs()
}, { immediate: true })
</script>

<template>
  <div class="py-10">
    <!--    This examples showcase import and reuse section control form the person-roles layer -->
    test <br />
    todo: add content here when the sections are added <br />
    {{ accountStore.currentAccount }}
  </div>
</template>
