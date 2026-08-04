<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'
import type { EffectiveDateSchema } from '../../../utils/schemas/effective-date'
import { getEffectiveDateSchema } from '../../../utils/schemas/effective-date'

const props = withDefaults(defineProps<{
  name?: string
  minDate?: string
  maxDate?: string
  required?: boolean
  disabled?: boolean
}>(), {
  required: true,
  disabled: false
})

const effectiveDateSchema = getEffectiveDateSchema(
  props.minDate,
  props.maxDate,
  props.required
)

const model = defineModel<EffectiveDateSchema>({ required: true })

const hintId = `effective-date-hint-${useId()}`

const formRef = useTemplateRef<Form<EffectiveDateSchema>>('effective-date-form')
const formError = computed<FormError | undefined>(() =>
  formRef.value
    ?.getErrors()
    .find(error =>
      error.name === 'dateInput'
      || error.name?.endsWith('.dateInput')
    )
)

const localState = reactive<EffectiveDateSchema>({ dateInput: model.value.dateInput })

watch(() => localState.dateInput, async (val) => {
  model.value = { dateInput: val ?? '' }
  await formRef.value?.validate().catch(() => {})
})

defineExpose({ formRef })
</script>

<template>
  <UForm
    ref="effective-date-form"
    :schema="effectiveDateSchema"
    :state="localState"
    nested
    :name="props.name"
    :validate-on="[]"
  >
    <ConnectFormFieldWrapper
      :label="$t('label.effectiveDate')"
      orientation="horizontal"
      :error="formError"
      padding-class="xy-default"
    >
      <UFormField
        name="dateInput"
        :ui="{ error: 'sr-only' }"
      >
        <template #default="{ error }">
          <Date
            v-model="localState.dateInput"
            :label="$t('label.effectiveDate')"
            :error="!!error"
            :described-by="hintId"
            :max-date="props.maxDate"
            :min-date="props.minDate"
            :disabled="props.disabled"
          />
          <p :id="hintId" :class="['mt-1 text-sm flex items-center gap-1', error ? 'text-error' : 'text-neutral']" aria-live="polite">
            <UIcon
              v-if="error"
              name="i-mdi-alert"
              class="size-4 shrink-0"
            />
            {{ error || $t('text.effectiveDateFormat') }}
          </p>
        </template>
      </UFormField>
    </ConnectFormFieldWrapper>
  </UForm>
</template>
