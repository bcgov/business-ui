<script setup lang="ts">
import type { FormError, Form, RadioGroupItem, InputProps } from '@nuxt/ui'

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

async function onDelayOptionChange(e: unknown) {
  const option = e as DelayOption
  model.value.date = ''

  await nextTick()
  if (option === DelayOption.CUSTOM) {
    const element = document.getElementById('delay-date-input')
    if (element) {
      element.focus({ preventScroll: true })
    }
  } else {
    // DelayOption.DEFAULT
    formRef.value?.clear()
  }
}
const uInputProps = computed<InputProps>(() => ({
  disabled: model.value.option === DelayOption.DEFAULT
}))
provide('UInput-props-delay-date-input', uInputProps)

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
  >
    <ConnectFieldset
      :label="order ? `${order}. ${t('label.delayDate')}` : t('label.delayDate')"
      :description="t('text.delayDateDescription')"
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        :label="t('label.delayFor')"
        orientation="horizontal"
        :error="dateError"
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
            <ConnectInputDate
              id="delay-date-input"
              v-model="model.date"
              :label="t('label.chooseAnEndDate')"
              @blur="formRef?.validate({ silent: true })"
            />
          </UFormField>
          <ConnectI18nHelper
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
