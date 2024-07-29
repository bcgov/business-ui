<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

</script>
<template>
  <div class="mx-auto flex max-w-[95vw] flex-col items-center justify-center gap-4 text-center">
    <SbcPageSectionH1 :heading="$t('page.home.h1')" />
  </div>
</template>
