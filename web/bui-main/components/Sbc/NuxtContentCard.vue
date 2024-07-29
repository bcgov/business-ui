<script setup lang="ts">
// simplify displaying nuxt content, dont need to call useAsyncData + query content each time
// matches whatever the current route and locale are where the component is mounted
// must use v-show if conditionally rendering content, wont be prerendered with v-if
const { locale } = useI18n()
const routeWithoutLocale = useRouteWithoutLocale()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  routeSuffix: {
    type: String,
    default: ''
  }
})

const fullId = 'content-data-' + props.id

const { data } = await useAsyncData(fullId, () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value + props.routeSuffix } })
    .findOne()
}, { watch: [locale] })
</script>
<template>
  <UCard class="w-full" :data-testid="fullId">
    <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
  </UCard>
</template>
