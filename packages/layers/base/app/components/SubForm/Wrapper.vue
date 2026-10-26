<script setup lang="ts">
// wrapper/container component used in table (or similar) expansion slots when opening a sub-form
const {
  container = true,
  hideRemove,
  variant
} = defineProps<{
  variant: FormVariant
  subject: string
  hideHeaderCancel?: boolean
  hideRemove?: boolean
  error?: boolean
  container?: boolean
  taskGuardConfig?: {
    message?: string
    messageId: string
    targetId: string
  }
}>()

defineEmits<{
  done: []
  cancel: []
  remove: []
}>()

const { t } = useI18n()
const labelId = useId()
const showRemoveButton = computed(() => hideRemove ? false : variant !== 'add')

const itemLabelPrefixMap: Record<FormVariant, string> = {
  edit: t('label.editing'),
  add: t('label.adding'),
  correct: t('label.correcting'),
  change: t('label.changing')
}

const removeButtonLabelMap: Record<FormVariant, string> = {
  edit: t('label.remove'),
  add: t('label.remove'),
  correct: t('label.delete'),
  change: t('label.delete')
}

const legendRef = useTemplateRef<HTMLLegendElement>('legendRef')
const isHeaderVisible = useElementVisibility(legendRef)

onMounted(async () => {
  await nextTick()
  if (!isHeaderVisible.value && legendRef.value) {
    const rect = legendRef.value.getBoundingClientRect()

    window.scrollTo({
      top: rect.top + window.scrollY - 60,
      behavior: 'smooth'
    })
  }
})
</script>

<template>
  <fieldset :aria-labelledby="labelId">
    <legend
      ref="legendRef"
      class="rounded-t bg-blue-350 py-4 flex justify-between items-center gap-2.5 w-full padding-x-default"
      :class="{
        'sr-only': !container
      }"
    >
      <span :id="labelId" class="text-white font-bold text-lg">
        {{ itemLabelPrefixMap[variant] }} {{ subject }}
      </span>
      <UButton
        v-if="!hideHeaderCancel"
        :label="$t('label.cancel')"
        class="font-normal py-0.5 px-2"
        trailing-icon="i-mdi-close"
        variant="ghost"
        color="secondary"
        @click="$emit('cancel')"
      />
    </legend>
    <div
      :class="{
        'rounded-b overflow-hidden bg-white border-l border-r border-b border-shade-secondary': container,
        'border-l-error border-l-3': error && container
      }"
    >
      <slot />
      <USeparator v-if="container" class="padding-x-default pb-4 xl:pb-8" />
      <div
        class="flex flex-col xl:flex-row gap-2 xl:gap-6 items-center"
        :class="{
          'px-4 xl:px-8 pb-4 xl:pb-8': container,
          'pt-4 xl:pt-8': !container,
          'justify-between': showRemoveButton,
          'justify-end': !showRemoveButton
        }"
      >
        <UButton
          v-if="showRemoveButton"
          :label="removeButtonLabelMap[variant]"
          variant="outline"
          color="error"
          class="w-full xl:w-min justify-center"
          @click="$emit('remove')"
        />
        <div class="flex flex-col xl:flex-row gap-2 xl:gap-6 justify-end items-center w-full xl:w-auto">
          <FormAlertMessage
            v-if="taskGuardConfig"
            :id="taskGuardConfig.messageId"
            :message="taskGuardConfig.message"
            class="w-full xl:max-w-md order-last xl:order-none text-sm text-center xl:text-right"
          />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            class="w-full xl:w-min justify-center"
            @click="$emit('cancel')"
          />
          <UButton
            :data-alert-focus-target="taskGuardConfig?.targetId"
            :aria-describedby="taskGuardConfig?.messageId"
            :label="$t('label.done')"
            class="w-full xl:w-min justify-center"
            @click="$emit('done')"
          />
        </div>
      </div>
    </div>
  </fieldset>
</template>
