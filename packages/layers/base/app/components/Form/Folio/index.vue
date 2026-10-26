<script setup lang="ts">
import type { FormError, Form, RadioGroupItem } from '@nuxt/ui'

type FolioOption = 'default' | 'transaction'

const { defaultFolio } = defineProps<{
  name?: string
  order?: string | number
  // the business's folio on file; defaults to the business store value
  defaultFolio?: string
}>()

const { t } = useI18n()
const businessStore = useBusinessStore()
const folioSchema = getFolioSchema()

const model = defineModel<FolioSchema>({ required: true })

const formRef = useTemplateRef<Form<FolioSchema>>('folio-form')

const formError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors && errors[0]
})

// when the business has a folio on file, offer it or a different number for this transaction only
const businessFolio = computed(() => defaultFolio ?? businessStore.businessFolio ?? '')

// a blank or matching folio is the default one, anything else was entered for this transaction
const folioOption = ref<FolioOption>(
  !model.value.folioNumber || model.value.folioNumber === businessFolio.value ? 'default' : 'transaction'
)

// the design marks the section optional when the business folio is offered
const fieldsetLabel = computed(() => businessFolio.value ? 'label.folioOrRefNumberOpt' : 'label.folioOrRefNumber')

const folioOptions = computed<RadioGroupItem[]>(() => [
  { label: t('label.useDefaultFolio', { folio: businessFolio.value }), value: 'default' },
  { label: t('label.useTransactionFolio'), value: 'transaction' }
])

// picking the default files the business folio; picking a different number starts from an empty input
watch(folioOption, (option) => {
  if (option === 'default') {
    model.value.folioNumber = businessFolio.value
  } else if (model.value.folioNumber === businessFolio.value) {
    model.value.folioNumber = ''
  }
})

// the model can be filled after mount (e.g. resuming a draft), so show a number entered for this transaction
watch(() => model.value.folioNumber, (folio) => {
  if (folio && folio !== businessFolio.value) {
    folioOption.value = 'transaction'
  }
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="folio-form"
    :schema="folioSchema"
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t(fieldsetLabel)}` : $t(fieldsetLabel)"
      :description="$t('text.folioDescription')"
      :error="businessFolio ? formError : undefined"
      body-variant="card"
      orientation="vertical"
    >
      <div
        v-if="businessFolio"
        class="px-4 py-6 sm:px-7.5 space-y-4"
      >
        <URadioGroup
          v-model="folioOption"
          data-testid="folio-option"
          :items="folioOptions"
        />
        <ConnectFormInput
          v-if="folioOption === 'transaction'"
          v-model="model.folioNumber"
          input-id="folio-input"
          :label="$t('label.folioOrRefNumberOpt')"
          name="folioNumber"
        />
      </div>
      <ConnectFormFieldWrapper
        v-else
        :label="$t('label.folioOrRefNumber')"
        orientation="horizontal"
        :error="formError"
        padding-class="xy-default"
      >
        <ConnectFormInput
          v-model="model.folioNumber"
          input-id="folio-input"
          :label="$t('label.folioOrRefNumberOpt')"
          name="folioNumber"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
