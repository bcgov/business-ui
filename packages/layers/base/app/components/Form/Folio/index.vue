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

// the section text differs between the two states of the design
const fieldsetDescription = computed(() =>
  businessFolio.value ? 'text.folioDefaultDescription' : 'text.folioDescription'
)

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
      :label="order ? `${order}. ${$t('label.folioOrRefNumberOpt')}` : $t('label.folioOrRefNumberOpt')"
      :error="businessFolio ? formError : undefined"
      body-variant="card"
      orientation="vertical"
    >
      <template #description>
        <div class="flex flex-col gap-2">
          <p>{{ $t(fieldsetDescription) }}</p>
          <HelpExpansion
            :label="$t('label.helpWithFolioOrRefNumbers')"
            t-key="text.folioHelp"
          />
        </div>
      </template>
      <URadioGroup
        v-if="businessFolio"
        v-model="folioOption"
        data-testid="folio-option"
        class="px-4 py-6 sm:px-7.5"
        :items="folioOptions"
        size="xl"
        :ui="{ fieldset: 'gap-y-6', item: 'gap-4', base: 'ring-neutral' }"
      >
        <template #description="{ item }">
          <!-- under its option so the input lines up with the option text, as in the design -->
          <div
            v-if="item.value === 'transaction' && folioOption === 'transaction'"
            class="pt-3 sm:w-3/4"
          >
            <ConnectFormInput
              v-model="model.folioNumber"
              input-id="folio-input"
              :label="$t('label.folioOrRefNumberOpt')"
              name="folioNumber"
            />
          </div>
        </template>
      </URadioGroup>
      <ConnectFormFieldWrapper
        v-else
        :label="$t('label.folioOrRefNumber')"
        orientation="vertical"
        :error="formError"
        padding-class="xy-default"
      >
        <div class="flex flex-col gap-4">
          <p>{{ $t('text.folioReceiptDescription') }}</p>
          <div class="sm:w-3/4">
            <ConnectFormInput
              v-model="model.folioNumber"
              input-id="folio-input"
              :label="$t('label.folioOrRefNumberOpt')"
              name="folioNumber"
            />
          </div>
        </div>
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
