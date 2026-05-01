<script setup lang="ts">
// wrapper/container component used in table (or similar) expansion slots when opening a sub-form
type Variant = 'edit' | 'add' | 'correct' | 'change'

const props = defineProps<{
  variant: Variant
  itemLabel: string
  hideHeaderCancel?: boolean
  hideRemove?: boolean
  error?: boolean
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
const showRemoveButton = props.hideRemove
  ? false
  : props.variant !== 'add'

const itemLabelPrefixMap: Record<Variant, string> = {
  edit: t('label.editing'),
  add: t('label.adding'),
  correct: t('label.correcting'),
  change: t('label.changing')
}

const removeButtonLabelMap: Record<Variant, string> = {
  edit: t('label.remove'),
  add: t('label.remove'),
  correct: t('label.delete'),
  change: t('label.delete')
}
</script>

<template>
  <fieldset :aria-labelledby="labelId">
    <legend class="rounded-t bg-blue-350 py-4 px-4 sm:px-8 flex justify-between items-center gap-2.5 w-full">
      <span :id="labelId" class="text-white font-bold">
        {{ itemLabelPrefixMap[variant] }} {{ itemLabel }}
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
      class="rounded-b overflow-hidden bg-white border-l border-r border-b border-shade-secondary"
      :class="error ? 'border-l-error border-l-3' : ''"
    >
      <slot />
      <div
        class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center px-4 sm:px-8 pb-4 sm:pb-8"
        :class="showRemoveButton ? 'justify-between' : 'justify-end'"
      >
        <UButton
          v-if="showRemoveButton"
          :label="removeButtonLabelMap[variant]"
          variant="outline"
          color="error"
          class="w-full sm:w-min justify-center"
          @click="$emit('remove')"
        />
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-end items-center w-full sm:w-min">
          <FormAlertMessage
            v-if="taskGuardConfig"
            :id="taskGuardConfig.messageId"
            :message="taskGuardConfig.message"
            class="min-w-fit order-last sm:order-none"
          />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            class="w-full sm:w-min justify-center"
            @click="$emit('cancel')"
          />
          <UButton
            :data-alert-focus-target="taskGuardConfig?.targetId"
            :aria-describedby="taskGuardConfig?.messageId"
            :label="$t('label.done')"
            class="w-full sm:w-min justify-center"
            @click="$emit('done')"
          />
        </div>
      </div>
    </div>
  </fieldset>
</template>
