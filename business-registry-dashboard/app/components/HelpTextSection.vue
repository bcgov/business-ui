<script setup lang="ts">
const { locale } = useI18n()
const showHelpText = ref(false)

const { data: helpText } = await useAsyncData('start-manage-business-help-text', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $contains: 'start-manage-business-help-text' } })
    .findOne()
}, { watch: [locale] })
</script>
<template>
  <UButton
    :label="showHelpText ? $t('btn.busStartHelp.hide') : $t('btn.busStartHelp.show')"
    variant="link"
    icon="i-mdi-help-circle-outline"
    class="max-w-fit"
    :ui="{ icon: { size: { sm: 'size-6' } } }"
    @click="showHelpText = !showHelpText"
  />
  <div
    class="mx-auto min-w-[75vw] max-w-screen-lg overflow-hidden border-y border-dashed border-gray-700 transition-all duration-500 ease-in-out"
    :class="{
      '-mb-3 max-h-0 opacity-0': !showHelpText,
      '-mb-0 max-h-[10000px] py-8 opacity-100': showHelpText,
    }"
  >
    <ContentRenderer :value="helpText" class="prose prose-bcGov prose-h3:text-center prose-p:my-8 min-w-full" />
    <div class="flex">
      <UButton
        :label="$t('btn.busStartHelp.hide')"
        variant="link"
        class="ml-auto"
        @click="showHelpText = false"
      />
    </div>
  </div>
</template>
