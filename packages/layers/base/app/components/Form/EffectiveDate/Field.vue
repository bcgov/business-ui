<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'
import { DateTime } from 'luxon'
import * as z from 'zod'
import { DATE_API_INPUT_FORMAT, DATE_DISPLAY_FORMAT, getDateSchema, parseInputDate } from '#base/app/utils/schemas/date'

const props = withDefaults(defineProps<{
  bounds?: DateBounds
  required?: boolean
  disabled?: boolean
  label: string
  formatHintText: string
  // not shown, but linked to the input via aria-describedby so screen readers read it - for
  // when a parent shows the hint once for several fields (e.g. FormEffectiveDateRange)
  srHintText?: string
  // highlights the input for a date range error, which is shown once below the start and end dates
  invalid?: boolean
}>(), {
  required: true,
  disabled: false
})

type ResolvedBound = { boundary: DateTime, message: string }

// parse the bound and fill in the default message - an empty/invalid date means no bound
function resolveBound(bound: DateBound | undefined, defaultKey: string): ResolvedBound | undefined {
  const boundary = bound?.date ? DateTime.fromFormat(bound.date, DATE_API_INPUT_FORMAT) : undefined
  if (!boundary?.isValid) {
    return undefined
  }
  return {
    boundary,
    message: bound?.message || $t(defaultKey, { date: boundary.toFormat(DATE_DISPLAY_FORMAT) })
  }
}

const minBound = computed(() => resolveBound(props.bounds?.min, 'validation.dateNotBeforeMin'))
const maxBound = computed(() => resolveBound(props.bounds?.max, 'validation.dateNotAfterMax'))

// getDateSchema handles required + format; bounds are checked here instead since getDateSchema
// collapses min + max into a single 'not in range' message, which would drop the custom messages
const dateSchema = computed(() => {
  const schema = getDateSchema({
    required: props.required,
    messages: {
      // formatHintText may be empty when a parent renders the hint itself (e.g. FormEffectiveDateRange)
      invalidDate: props.formatHintText || $t('validation.invalidDate'),
      required: $t('validation.dateRequired')
    }
  })
  // invalid formats are handled by the format refinement, so only compare dates that parse
  const isValidOrEmpty = (val: string, compare: (entered: DateTime) => boolean) => {
    const entered = parseInputDate(val)
    return !entered || compare(entered)
  }
  const min = minBound.value
  const max = maxBound.value
  let dateInput = schema.shape.dateInput
  if (min) {
    dateInput = dateInput.refine(val => isValidOrEmpty(val, entered => entered >= min.boundary), min.message)
  }
  if (max) {
    dateInput = dateInput.refine(val => isValidOrEmpty(val, entered => entered <= max.boundary), max.message)
  }
  return z.object({ dateInput })
})

const model = defineModel<EffectiveDateSchema>({ required: true })

const hintId = `effective-date-hint-${useId()}`

const formRef = useTemplateRef<Form<EffectiveDateSchema>>('date-field-form')
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
    return props.formatHintText
  }
  if (err === $t('validation.dateRequired') && props.formatHintText) {
    return `${err}. ${props.formatHintText}`
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
  if (err.message === $t('validation.dateRequired')) {
    return hintText.value
  }
  return `${val}, ${$t('validation.invalidDate')}, ${hintText.value}`
}

watch(() => localState.dateInput, async (val) => {
  model.value = { dateInput: val ?? '' }
  await formRef.value?.validate().catch(() => {})
  liveAnnouncement.value = buildAnnouncement()
})

defineExpose({ formRef, formError })
defineOptions({ inheritAttrs: false })
</script>

<template>
  <UForm
    ref="date-field-form"
    :schema="dateSchema"
    :state="localState"
    :validate-on="[]"
  >
    <UFormField
      name="dateInput"
      :description="srHintText"
      :ui="{ error: 'sr-only', description: 'sr-only', container: 'mt-0' }"
    >
      <template #default="{ error }">
        <ConnectInputDatePicker
          ref="date-input"
          v-model="localState.dateInput"
          :label="label"
          :error="!!error || props.invalid"
          :help="hintText"
          :max-date="maxBound ? props.bounds?.max?.date : undefined"
          :min-date="minBound ? props.bounds?.min?.date : undefined"
          :required
          :disabled
        />
        <p
          v-if="hintText"
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
