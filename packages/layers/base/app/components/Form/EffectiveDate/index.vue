<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import type { Form, FormError } from '@nuxt/ui'
import { DateTime } from 'luxon'

const props = defineProps<{
  name?: string
}>()

const { t } = useI18n()

const effectiveDateSchema = getEffectiveDateSchema()

const model = defineModel<EffectiveDateSchema>({ required: true })

const formRef = useTemplateRef<Form<EffectiveDateSchema>>('effective-date-form')
const formError = computed<FormError | undefined>(() => formRef.value?.getErrors()?.[0])

const localState = reactive<EffectiveDateSchema>({ effectiveDate: model.value.effectiveDate })

const isCalendarOpen = ref(false)

const calendarValue = computed(() => {
  if (!localState.effectiveDate) return undefined
  const dt = DateTime.fromFormat(localState.effectiveDate, DATE_DISPLAY_FORMAT)
  if (!dt.isValid) return undefined
  return new CalendarDate(dt.year, dt.month, dt.day)
})

function onDateSelect(date: DateValue | DateRange | DateValue[] | null | undefined) {
  if (!date || Array.isArray(date) || !('year' in date)) return
  const dt = DateTime.fromObject({ year: date.year, month: date.month, day: date.day })
  localState.effectiveDate = dt.toFormat(DATE_DISPLAY_FORMAT)
  syncModelFromLocal()
  isCalendarOpen.value = false
}

function normalizeDate(input: string): string {
  if (!input.trim()) return input

  const trimmed = input.trim()

  if (DateTime.fromFormat(trimmed, DATE_DISPLAY_FORMAT).isValid) return trimmed

  // Ensure space between letters and digits, and after commas
  const preprocessed = trimmed
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/,(\S)/g, ', $1')
    .replace(/\b([a-z])/g, (_, c) => c.toUpperCase())

 for (const fmt of DATE_INPUT_FORMATS) {
    const dt = DateTime.fromFormat(preprocessed, fmt)
    if (dt.isValid) return dt.toFormat(DATE_DISPLAY_FORMAT)
  }

  return trimmed
}

function syncModelFromLocal() {
  const trimmed = localState.effectiveDate.trim()

  if (!trimmed) {
    model.value = { effectiveDate: '' }
    return
  }

  const parsed = DateTime.fromFormat(trimmed, DATE_DISPLAY_FORMAT)
  if (!parsed.isValid) return

  const formattedDate = parsed.toFormat(DATE_API_INPUT_FORMAT)
  model.value = { effectiveDate: formattedDate }
}

async function validateNormalizedDate() {
  localState.effectiveDate = normalizeDate(localState.effectiveDate)

  await nextTick()
  await formRef.value?.validate()
  syncModelFromLocal()
}

onMounted(() => {
  const normalized = normalizeDate(localState.effectiveDate)
  if (normalized !== localState.effectiveDate) {
    localState.effectiveDate = normalized
  }
})

function clearDate() {
  localState.effectiveDate = ''
  syncModelFromLocal()
}

async function onInputBlur() {
  try {
    await validateNormalizedDate()
  } catch {
    // Error state is managed by UForm; swallow rejected validation promise.
  }
}

defineExpose({ formRef, validateNormalizedDate })
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
        name="effectiveDate"
        :ui="{ error: 'sr-only' }"
      >
        <template #default="{ error }">
          <UInput
            id="effective-date-input"
            v-model="localState.effectiveDate"
            class="w-full"
            placeholder="&nbsp;"
            :color="error ? 'error' : 'neutral'"
            :highlight="!!error"
            @blur="onInputBlur"
          >
            <label
              for="effective-date-input"
              class="floating-label-input"
            >
              {{ t('label.effectiveDate') }}
            </label>
            <template #trailing>
              <UButton
                v-if="localState.effectiveDate"
                icon="i-mdi-close"
                color="neutral"
                variant="ghost"
                :ui="{ base: 'text-primary size-7' }"
                @click="clearDate"
              />
              <UPopover v-model:open="isCalendarOpen" :content="{ side: 'top' }">
                <UButton
                  icon="i-mdi-calendar"
                  color="neutral"
                  variant="ghost"
                  :ui="{ base: 'text-primary size-7' }"
                />
                <template #content>
                  <UCalendar
                    :model-value="calendarValue"
                    @update:model-value="onDateSelect"
                  />
                </template>
              </UPopover>
            </template>
          </UInput>
          <p :class="['mt-1 text-sm flex items-center gap-1', error ? 'text-error' : 'text-neutral']">
            <template v-if="error">
              <UIcon name="i-mdi-alert" class="size-4 shrink-0" />
              {{ error }}.
            </template>
            {{ t('text.effectiveDateFormat') }}
          </p>
        </template>
      </UFormField>
    </ConnectFormFieldWrapper>
  </UForm>
</template>
