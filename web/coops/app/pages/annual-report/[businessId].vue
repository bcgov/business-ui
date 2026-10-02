<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth',
  middleware: ['connect-auth']
})

useHead({
  title: t('page.annualReport.title')
})
</script>

<template>
  <h1>{{ $t('page.annualReport.h1') }}</h1>
</template>
