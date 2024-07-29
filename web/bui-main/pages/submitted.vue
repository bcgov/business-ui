<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const busStore = useBusinessStore()
const localePath = useLocalePath()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.submitted.title')
})

definePageMeta({
  middleware: ['require-account']
})

async function initPage () {
  try {
    if (!route.query.filing_id) {
      throw new Error('Missing filing id in url.')
    } else {
      // check filing status details
      await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
      if (busStore.payStatus !== 'PAID') {
        return navigateTo(localePath('/annual-report'))
      }
    }
  } catch (e) {
    // go back to ar page if no filing id or error in the PUT request
    console.error((e as Error).message)
    return navigateTo(localePath('/annual-report'))
  } finally {
    pageLoading.value = false
  }
}

if (import.meta.client) {
  initPage()
}
</script>
<template>
  <div v-show="!pageLoading" class="mx-auto flex flex-col items-center justify-center gap-4 text-center">
    <SbcPageSectionH1 class="flex items-center gap-2">
      <span>{{ $t('page.submitted.h1') }}</span>
      <UIcon
        name="i-mdi-check-circle-outline"
        class="size-10 shrink-0 text-outcomes-approved"
      />
    </SbcPageSectionH1>
    <SbcAlert
      :show-on-category="[
        AlertCategory.INTERNAL_SERVER_ERROR,
        AlertCategory.DOCUMENT_DOWNLOAD
      ]"
    />
    <SbcNuxtContentCard id="submitted-success-text" route-suffix="/success-text" />
    <SbcNuxtContentCard id="submitted-platform-info" route-suffix="/platform-info" />
  </div>
</template>
