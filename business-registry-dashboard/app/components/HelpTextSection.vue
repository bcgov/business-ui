<script setup lang="ts">
import { UInput } from '#components'
const { locale } = useI18n()
const showHelpText = ref(false)
const showHelpTextBtnRef = ref<InstanceType<typeof UInput> | null>(null)

const toggleHelpText = () => {
  showHelpText.value = !showHelpText.value
  if (!showHelpText.value) {
    showHelpTextBtnRef.value?.$el.focus()
    showHelpTextBtnRef.value?.$el.scrollIntoView({ block: 'center', behaviour: 'smooth' })
  }
}

const { data: helpText } = await useAsyncData('start-manage-business-help-text-' + locale.value, () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $contains: 'start-manage-business-help-text' } })
    .findOne()
})
</script>
<template>
  <UButton
    ref="showHelpTextBtnRef"
    :label="showHelpText ? $t('btn.busStartHelp.hide') : $t('btn.busStartHelp.show')"
    variant="link"
    icon="i-mdi-help-circle-outline"
    class="-mt-1 self-start"
    :aria-expanded="showHelpText"
    :padded="false"
    aria-controls="help-text-content"
    :ui="{ icon: { size: { sm: 'size-6' } } }"
    @click="toggleHelpText"
  />
  <div
    id="help-text-content"
    :aria-hidden="!showHelpText"
    role="region"
    class="mx-auto max-w-bcGovLg overflow-hidden border-y border-dashed border-gray-700 transition-all duration-500 ease-in-out"
    :class="{
      '-mb-3 max-h-0 opacity-0': !showHelpText,
      '-mb-0 max-h-[10000px] py-8 opacity-100': showHelpText,
    }"
  >
    <ContentRenderer :value="helpText" class="prose prose-bcGov prose-h3:text-center prose-p:my-8 prose-ol:space-y-10 max-w-bcGovLg" />
    <div class="flex">
      <UButton
        :label="$t('btn.busStartHelp.hide')"
        variant="link"
        class="ml-auto"
        @click="toggleHelpText"
      />
    </div>
  </div>
</template>
