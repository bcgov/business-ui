<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['connect-auth']
})

const { t } = useI18n()
const route = useRoute()
const businessStore = useBusinessStore()
const { tombstone } = useConnectTombstone()

const businessId = route.params.businessId as string
const loading = ref(true)

useHead({ title: t('page.dashboard.title') })
useDashboardBreadcrumbs()

// FUTURE: replaced by useDashboardLoad + useDashboardTombstone (temp registrations, load errors)
async function loadBusiness() {
  tombstone.value.loading = true
  try {
    if (!isTempRegIdentifier(businessId)) {
      await businessStore.init(businessId, true)
    }
  } catch (error) {
    console.error('Failed to load the business', error)
  }
  tombstone.value.title = { as: 'h1', text: businessStore.businessName || businessId }
  tombstone.value.loading = false
  loading.value = false
}

onMounted(loadBusiness)
</script>

<template>
  <div data-testid="business-dashboard" class="py-6 sm:py-10">
    <ConnectSpinner v-if="loading" fullscreen />
  </div>
</template>
