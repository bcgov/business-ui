<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth',
  middleware: ['connect-auth', 'app-redirect']
})

useHead({
  title: t('page.index.title')
})
</script>

<template>
  <h1>{{ $t('page.index.h1') }}</h1>
</template>
