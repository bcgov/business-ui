<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'
import { DateTime } from 'luxon'
import { DATE_API_INPUT_FORMAT, DATE_DISPLAY_FORMAT, getDateSchema } from '#base/app/utils/schemas/date'

const props = withDefaults(defineProps<{
  minDate?: string
  maxDate?: string
  required?: boolean
  disabled?: boolean
}>(), {
  required: true,
  disabled: false
})

const minBoundary = computed(() =>
  props.minDate ? DateTime.fromFormat(props.minDate, DATE_API_INPUT_FORMAT) : undefined
)
const maxBoundary = computed(() =>
  props.maxDate ? DateTime.fromFormat(props.maxDate, DATE_API_INPUT_FORMAT) : undefined
)

const effectiveDateSchema = getDateSchema({
  required: props.required,
  minDate: props.minDate,
  maxDate: props.maxDate,
  messages: {
    invalidDate: $t('text.effectiveDateFormat'),
    minDate: minBoundary.value?.isValid
      ? $t('validation.dateNotBeforeMin', { date: minBoundary.value.toFormat(DATE_DISPLAY_FORMAT) })
      : undefined,
    maxDate: maxBoundary.value?.isValid
      ? $t('validation.dateNotAfterMax', { date: maxBoundary.value.toFormat(DATE_DISPLAY_FORMAT) })
      : undefined,
    dateRange: minBoundary.value?.isValid && maxBoundary.value?.isValid
      ? $t('validation.dateNotInRange', {
        minDate: minBoundary.value.toFormat(DATE_DISPLAY_FORMAT),
        maxDate: maxBoundary.value.toFormat(DATE_DISPLAY_FORMAT)
      })
      : undefined,
    required: $t('validation.fieldRequired')
  }
})

const model = defineModel<EffectiveDateSchema>({ required: true })

const hintId = `effective-date-hint-${useId()}`

const formRef = useTemplateRef<Form<EffectiveDateSchema>>('effective-date-form')
const dateRef = useTemplateRef<{ $el: HTMLElement }>('date-input')
const formError = computed<FormError | undefined>(() =>
  formRef.value
    ?.getErrors()
    .find(error =>
      error.name === 'dateInput'
      || error.name?.endsWith('.dateInput')
    )
)

const localState = reactive<EffectiveDateSchema>({ dateInput: model.value.dateInput })

const hintText = computed(() => {
  const err = formError.value?.message
  if (!err) {
    return $t('text.effectiveDateFormat')
  }
  if (err === $t('validation.fieldRequired')) {
    return `${err}. ${$t('text.effectiveDateFormat')}`
  }
  return err
})

const liveAnnouncement = ref('')

function buildAnnouncement(): string {
  const err = formError.value
  const val = localState.dateInput.trim()
  if (!err) {
    const displayVal = (dateRef.value?.$el?.querySelector('input') as HTMLInputElement | null)?.value.trim()
    return displayVal || val
  }
  if (err.message === $t('validation.fieldRequired')) {
    return hintText.value
  }
  return `${val}, ${$t('validation.invalidDate')}, ${hintText.value}`
}

watch(() => localState.dateInput, async (val) => {
  model.value = { dateInput: val ?? '' }
  await formRef.value?.validate().catch(() => {})
  liveAnnouncement.value = buildAnnouncement()
})

defineExpose({ formRef })
defineOptions({ inheritAttrs: false })
</script>

<template>
  <UForm
    ref="effective-date-form"
    :schema="effectiveDateSchema"
    :state="localState"
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
          <ConnectInputDatePicker
            ref="date-input"
            v-model="localState.dateInput"
            :label="$t('label.effectiveDate')"
            :error="!!error"
            :help="hintText"
            :max-date="props.maxDate"
            :min-date="props.minDate"
            :required="props.required"
            :disabled="props.disabled"
          />
          <p
            :id="hintId"
            :class="['mt-1 text-sm flex items-start gap-1', error ? 'text-error' : 'text-neutral']"
          >
            <UIcon
              v-if="error"
              name="i-mdi-alert"
              class="size-4 shrink-0 mt-0.5"
            />
            {{
              hintText
            }}
          </p>
        </template>
      </UFormField>
    </ConnectFormFieldWrapper>
  </UForm>
  <!-- teleport to body so the region is registered before any v-if mount/unmount cycle -->
  <Teleport to="body">
    <span
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >{{ liveAnnouncement }}</span>
  </Teleport>
</template>
