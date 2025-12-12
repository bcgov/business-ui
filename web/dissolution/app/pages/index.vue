<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'connect-auth'
})

useHead({
  title: t('page.index.title')
})
</script>

<template>
  <h1>{{ $t('page.index.h1') }}</h1>
</template>
