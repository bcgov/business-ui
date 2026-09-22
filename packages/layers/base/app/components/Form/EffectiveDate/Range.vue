<script setup lang="ts">
import type { Form } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  minDate?: string
  maxDate?: string
  startRequired?: boolean
  endRequired?: boolean
  disabled?: boolean
  label?: string
  description: string
  startLabel?: string
  endLabel?: string
  formatHintText?: string
}>(), {
  startRequired: true,
  endRequired: false,
  disabled: false
})

const label = computed(() => props.label ?? $t('label.effectiveDateRange'))
const startLabel = computed(() => props.startLabel ?? $t('label.startDate'))
const endLabel = computed(() => props.endLabel ?? $t('label.endDate'))
const formatHintText = computed(() => props.formatHintText ?? $t('text.effectiveDateFormat'))

const startModel = defineModel<EffectiveDateSchema>('start', { required: true })
const endModel = defineModel<EffectiveDateSchema>('end', { required: true })

const startFieldRef = useTemplateRef<FormEffectiveDateFieldRef>('start-date-field')
const endFieldRef = useTemplateRef<FormEffectiveDateFieldRef>('end-date-field')
const startFormRef = computed<Form<EffectiveDateSchema> | undefined>(() => startFieldRef.value?.formRef ?? undefined)
const endFormRef = computed<Form<EffectiveDateSchema> | undefined>(() => endFieldRef.value?.formRef ?? undefined)
const rangeError = computed(() => startFieldRef.value?.formError ?? endFieldRef.value?.formError)

// end (cessation) date can never be before start (effective) date - bind its lower bound to
// the live start value rather than a static prop
const endMinDate = computed(() => startModel.value.dateInput || props.minDate)

// End's own schema picks up the new minDate reactively, but nothing re-runs its validation
// when start changes rather than end itself - only refresh if end already has a value or a
// visible error, so we don't manufacture a "required" error on an end date the user hasn't
// touched yet just because they edited the start date
watch(() => startModel.value.dateInput, async () => {
  if (endModel.value.dateInput || endFieldRef.value?.formError) {
    // wait for the end field to re-render with its updated (reactive) minDate prop before
    // validating, otherwise it would still validate against the stale bound
    await nextTick()
    await endFieldRef.value?.formRef?.validate().catch(() => {})
  }
})

defineExpose({ startFormRef, endFormRef })
defineOptions({ inheritAttrs: false })
</script>

<template>
  <ConnectFormFieldWrapper
    :label="label"
    orientation="horizontal"
    :error="rangeError"
    padding-class="xy-default"
  >
    <p class="text-sm text-neutral mb-4">
      {{ description }}
    </p>
    <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
      <div class="flex-1">
        <FormEffectiveDateField
          ref="start-date-field"
          v-model="startModel"
          :label="startLabel"
          :format-hint-text="formatHintText"
          :max-date="props.maxDate"
          :min-date="props.minDate"
          :required="props.startRequired"
          :disabled="props.disabled"
        />
      </div>
      <span class="hidden sm:block text-sm text-neutral pt-3">{{ $t('label.to') }}</span>
      <div class="flex-1">
        <FormEffectiveDateField
          ref="end-date-field"
          v-model="endModel"
          :label="endLabel"
          :format-hint-text="formatHintText"
          :max-date="props.maxDate"
          :min-date="endMinDate"
          :required="props.endRequired"
          :disabled="props.disabled"
        />
      </div>
    </div>
  </ConnectFormFieldWrapper>
</template>
