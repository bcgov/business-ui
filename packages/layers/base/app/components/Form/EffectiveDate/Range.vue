<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { DateTime } from 'luxon'
import { DATE_API_INPUT_FORMAT } from '#base/app/utils/schemas/date'

const props = withDefaults(defineProps<{
  startBounds?: DateBounds
  endBounds?: DateBounds
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

// start must be on or before end - shown once below both fields since it involves both dates.
// Skipped until both dates are valid; each field reports its own missing/invalid date
const orderError = computed(() => {
  const start = DateTime.fromFormat(startModel.value.dateInput, DATE_API_INPUT_FORMAT)
  const end = DateTime.fromFormat(endModel.value.dateInput, DATE_API_INPUT_FORMAT)
  return start.isValid && end.isValid && end < start ? $t('validation.dateRangeOutOfOrder') : undefined
})

const rangeError = computed(() =>
  startFieldRef.value?.formError ?? endFieldRef.value?.formError ?? !!orderError.value
)

const rangeRef = useTemplateRef<HTMLElement>('range')

// validates both fields and the start/end order - rejects in the same shape as a UForm validation
// error ({ errors: [{ id }] }) so a parent can focus the first invalid input
async function validate() {
  const results = await Promise.allSettled([startFormRef.value?.validate(), endFormRef.value?.validate()])
  const rejected = results.find(r => r.status === 'rejected')
  if (rejected) {
    throw rejected.reason
  }
  if (orderError.value) {
    const id = rangeRef.value?.querySelectorAll('input')[1]?.id
    throw { errors: [{ id, name: 'dateInput', message: orderError.value }] }
  }
}

defineExpose({ startFormRef, endFormRef, validate })
defineOptions({ inheritAttrs: false })
</script>

<template>
  <ConnectFormFieldWrapper
    :label="label"
    orientation="horizontal"
    :error="rangeError"
    padding-class="xy-default"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p class="text-sm text-neutral mb-4" v-html="description" />
    <div ref="range" class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
      <div class="flex-1">
        <FormEffectiveDateField
          ref="start-date-field"
          v-model="startModel"
          :label="startLabel"
          format-hint-text=""
          :sr-hint-text="orderError || formatHintText"
          :bounds="props.startBounds"
          :invalid="!!orderError"
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
          format-hint-text=""
          :sr-hint-text="orderError || formatHintText"
          :bounds="props.endBounds"
          :invalid="!!orderError"
          :required="props.endRequired"
          :disabled="props.disabled"
        />
      </div>
    </div>
    <!-- shown once for both fields; each input also reads it via srHintText. The order error takes the
      format hint's place, and is announced when it appears -->
    <p
      v-if="orderError"
      role="alert"
      data-testid="effective-date-range-error"
      class="mt-3 text-sm text-error flex items-start gap-1"
    >
      <UIcon name="i-mdi-alert" class="size-4 shrink-0 mt-0.5" />
      {{ orderError }}
    </p>
    <p
      v-else
      class="mt-3 text-sm text-neutral"
      aria-hidden="true"
    >
      {{ formatHintText }}
    </p>
  </ConnectFormFieldWrapper>
</template>
