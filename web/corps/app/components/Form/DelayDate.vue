<script setup lang="ts">
import type { FormError, Form, RadioGroupItem } from '@nuxt/ui'
import type { ComponentPublicInstance } from 'vue'
import { DateTime } from 'luxon'

const { t } = useI18n()

const props = defineProps<{
  name?: string
  order?: string | number
  isStaff: boolean
  delayDateDisplay: string
}>()

const schema = getDelayDateSchema()

const model = defineModel<DelayDateSchema>({ required: true })

const formRef = useTemplateRef<Form<DelayDateSchema>>('delay-date-form')

const dateError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors?.find(e => e.name === 'date')
})

const delayOptions = computed<RadioGroupItem[]>(() => {
  const options = [{ label: t('label.sixMonths'), value: DelayOption.DEFAULT }]

  if (props.isStaff) {
    options.push({ label: t('label.selectADate'), value: DelayOption.CUSTOM })
  }

  return options
})

const delayDateInputRef = useTemplateRef('delay-date-input')

async function onDelayOptionChange(e: unknown) {
  const option = e as DelayOption
  model.value.date = ''

  await nextTick()
  if (option === DelayOption.CUSTOM) {
    const element = (delayDateInputRef.value as ComponentPublicInstance | null)?.$el?.querySelector('input')
    element?.focus({ preventScroll: true })
  } else {
    // DelayOption.DEFAULT
    formRef.value?.clear()
  }
}

const isDateInputDisabled = computed(() => model.value.option === DelayOption.DEFAULT)

// ConnectInputDatePicker never emits an 'input' event onto the form bus (only 'blur'),
// so UForm's default validateOn never revalidates this field as the user types. Drive
// it manually instead, matching EffectiveDate/index.vue's workaround for the same gap.
watch(() => model.value.date, () => {
  formRef.value?.validate({ silent: true })
})

// mirrors the schema's "must be after today" rule (Pacific time) so the calendar
// itself never offers a date the form would then reject
const minDate = computed(() =>
  DateTime.fromISO(getToday('America/Vancouver'), { zone: 'America/Vancouver' }).plus({ days: 1 }).toISODate() ?? undefined
)

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="delay-date-form"
    :schema
    nested
    :name
    :validate-on="[]"
  >
    <ConnectFieldset
      :label="order ? `${order}. ${t('label.delayDate')}` : t('label.delayDate')"
      :description="t('text.delayDateDescription')"
      body-variant="card"
      orientation="vertical"
    >
      <ConnectFormFieldWrapper
        :label="t('label.delayFor')"
        orientation="horizontal"
        :error="dateError"
        padding-class="xy-default"
      >
        <div class="flex flex-col gap-4">
          <UFormField name="option">
            <URadioGroup
              v-model="model.option"
              :items="delayOptions"
              @update:model-value="onDelayOptionChange"
            />
          </UFormField>
          <UFormField
            v-if="isStaff"
            name="date"
            :help="t('text.formatYYYYMMDD')"
          >
            <ConnectInputDatePicker
              :key="model.option"
              ref="delay-date-input"
              data-testid="delay-date-input"
              v-model="model.date"
              :label="t('label.chooseAnEndDate')"
              :disabled="isDateInputDisabled"
              :min-date="minDate"
            />
          </UFormField>
          <ConnectI18nHelper
            v-if="isStaff"
            as="p"
            data-testid="expected-dissolution-date-info"
            :date="delayDateDisplay"
            translation-path="page.dissolution.delay.desc"
          />
        </div>
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
