<script setup lang="ts">
import type { Form } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  minDate?: string
  maxDate?: string
  required?: boolean
  disabled?: boolean
  label?: string
  inputLabel?: string
  formatHintText?: string
}>(), {
  required: true,
  disabled: false
})

// default to effective date text unless a consumer (e.g. cessation date) overrides it
const label = computed(() => props.label ?? $t('label.effectiveDate'))
const inputLabel = computed(() => props.inputLabel ?? $t('label.enterOrSelectEffectiveDate'))
const formatHintText = computed(() => props.formatHintText ?? $t('text.effectiveDateFormat'))

const model = defineModel<EffectiveDateSchema>({ required: true })

const fieldRef = useTemplateRef<FormEffectiveDateFieldRef>('date-field')
const formRef = computed<Form<EffectiveDateSchema> | undefined>(() => fieldRef.value?.formRef ?? undefined)
const fieldError = computed(() => fieldRef.value?.formError)

defineExpose({ formRef })
defineOptions({ inheritAttrs: false })
</script>

<template>
  <ConnectFormFieldWrapper
    :label="label"
    orientation="horizontal"
    :error="fieldError"
    padding-class="xy-default"
  >
    <FormEffectiveDateField
      ref="date-field"
      v-model="model"
      :label="inputLabel"
      :format-hint-text="formatHintText"
      :max-date="props.maxDate"
      :min-date="props.minDate"
      :required="props.required"
      :disabled="props.disabled"
    />
  </ConnectFormFieldWrapper>
</template>
