<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import type { Form, FormError } from '@nuxt/ui'
import { DateTime } from 'luxon'
import { DATE_DISPLAY_FORMAT, DATE_INPUT_FORMATS } from '~/utils/schemas/effective-date'

const props = defineProps<{
  name?: string
}>()

const { t } = useI18n()

const effectiveDateSchema = getEffectiveDateSchema()

const model = defineModel<EffectiveDateSchema>({ required: true })

const formRef = useTemplateRef<Form<EffectiveDateSchema>>('effective-date-form')
const formError = computed<FormError | undefined>(() => formRef.value?.getErrors()?.[0])

const isCalendarOpen = ref(false)

const calendarValue = computed(() => {
  if (!model.value.effectiveDate) return undefined
  const dt = DateTime.fromFormat(model.value.effectiveDate, DATE_DISPLAY_FORMAT)
  if (!dt.isValid) return undefined
  return new CalendarDate(dt.year, dt.month, dt.day)
})

function onDateSelect(date: DateValue | DateRange | DateValue[] | null | undefined) {
  if (!date || Array.isArray(date) || !('year' in date)) return
  const dt = DateTime.fromObject({ year: date.year, month: date.month, day: date.day })
  model.value.effectiveDate = dt.toFormat(DATE_DISPLAY_FORMAT)
  isCalendarOpen.value = false
  formRef.value?.validate({ silent: true })
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

function clearDate() {
  model.value.effectiveDate = ''
  formRef.value?.clear('effectiveDate')
}

async function onInputBlur() {
  const normalized = normalizeDate(model.value.effectiveDate)
  if (normalized !== model.value.effectiveDate) {
    model.value.effectiveDate = normalized
  }
  await nextTick()
  formRef.value?.validate({ silent: true })
}

watch(() => model.value.effectiveDate, () => {
  formRef.value?.clear('effectiveDate')
})

defineExpose({ formRef })
</script>

<template>
  <UForm
    ref="effective-date-form"
    :schema="effectiveDateSchema"
    :validate-on="['blur', 'submit']"
    nested
    :name
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
            v-model="model.effectiveDate"
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
                v-if="model.effectiveDate"
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
