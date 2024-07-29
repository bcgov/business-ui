<script setup lang="ts">
const pageLoading = useState('page-loading', () => true) // global loading state
const { locale } = useI18n()

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true
})

// set lang and dir attributes on head
useHead({
  htmlAttrs: {
    lang: () => i18nHead.value.htmlAttrs!.lang,
    dir: () => i18nHead.value.htmlAttrs!.dir
  }
})

const appVersion = await getAppMetaInfo() // load ui and api version on app mount

// query help markdown and globally provide to use in either pages/help.vue or <SbcHelpModal />
// if queried directly from modal, it wont be prerendered because modal is hidden initially
const { data: helpDocs } = await useAsyncData('help-docs-query', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: '/help' } })
    .findOne()
}, { watch: [locale] })
provide('sbc-bar-help-docs', helpDocs)
</script>
<template>
  <div
    class="relative flex min-h-screen flex-col bg-bcGovColor-gray1 dark:bg-bcGovGray-900"
  >
    <NuxtLoadingIndicator color="#1669bb" />
    <ClientOnly>
      <SbcLoadingSpinner v-if="pageLoading" overlay />
    </ClientOnly>
    <SbcHeaderMain :app-version="appVersion" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SbcFooter :app-version="appVersion" />
    <SbcHelpModal />
  </div>
</template>
