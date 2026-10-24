<script setup lang="ts">
import type { FormError, Form, RadioGroupItem } from '@nuxt/ui'

type FolioOption = 'default' | 'transaction'

const { defaultFolio } = defineProps<{
  name?: string
  order?: string | number
  // when set, offers the business's default folio or a different one for this transaction only
  defaultFolio?: string
}>()

const { t } = useI18n()
const folioSchema = getFolioSchema()

const model = defineModel<FolioSchema>({ required: true })

const formRef = useTemplateRef<Form<FolioSchema>>('folio-form')

const formError = computed<FormError | undefined>(() => {
  const errors = formRef.value?.getErrors()
  return errors && errors[0]
})

// a blank folio is filed as the default one, so it shows as the default option
const folioOption = ref<FolioOption>(
  !model.value.folioNumber || model.value.folioNumber === defaultFolio ? 'default' : 'transaction'
)
let transactionFolio = folioOption.value === 'transaction' ? model.value.folioNumber ?? '' : ''

const folioOptions = computed<RadioGroupItem[]>(() => [
  { label: t('label.useDefaultFolio', { folio: defaultFolio }), value: 'default' },
  { label: t('label.useTransactionFolio'), value: 'transaction' }
])

watch(folioOption, (option) => {
  if (option === 'default') {
    transactionFolio = model.value.folioNumber ?? ''
    model.value.folioNumber = defaultFolio
  } else {
    model.value.folioNumber = transactionFolio
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
      v-if="defaultFolio"
      :label="order ? `${order}. ${$t('label.folioOrRefNumberOpt')}` : $t('label.folioOrRefNumberOpt')"
      :description="$t('text.folioTransactionDescription')"
      :error="formError"
      body-variant="card"
      orientation="vertical"
    >
      <div class="px-4 py-6 sm:px-7.5 space-y-4">
        <URadioGroup
          v-model="folioOption"
          data-testid="folio-option"
          :items="folioOptions"
        />
        <ConnectFormInput
          v-if="folioOption === 'transaction'"
          v-model="model.folioNumber"
          input-id="folio-input"
          :label="$t('label.temporaryFolio')"
          name="folioNumber"
        />
      </div>
    </ConnectFieldset>
    <ConnectFieldset
      v-else
      :label="order ? `${order}. ${$t('label.folioOrRefNumber')}` : $t('label.folioOrRefNumber')"
      :description="$t('text.folioDescription')"
      body-variant="card"
      orientation="vertical"
    >
      <ConnectFormFieldWrapper
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
