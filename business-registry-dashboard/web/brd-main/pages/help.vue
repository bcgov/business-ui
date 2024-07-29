<script setup lang="ts">
const { t } = useI18n()
const pageLoading = useState('page-loading')
pageLoading.value = false

definePageMeta({
  order: 0
})

useHead({
  title: t('page.help.title')
})
</script>
<template>
  <div v-show="!pageLoading" class="mx-auto flex w-full justify-center md:min-w-[700px] md:max-w-screen-md">
    <SbcHelpContent />
  </div>
</template>
