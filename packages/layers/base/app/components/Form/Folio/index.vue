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
const accountStore = useConnectAccountStore()
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

// the section text and the help content differ between the two states of the design
const fieldsetDescription = computed(() =>
  businessFolio.value ? 'text.folioDefaultDescription' : 'text.folioDescription'
)
const helpKey = computed(() => `text.folioHelp.${businessFolio.value ? 'withFolio' : 'noFolio'}`)

// the help links to the page where the business's default folio is changed
const businessEditUrl = computed(() => getBusinessEditUrl(
  businessStore.business?.identifier ?? '',
  businessStore.business?.legalType ?? '',
  accountStore.currentAccount?.id
))

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
        <!-- cancel the link button's bottom padding so the card sits at the fieldset gap, as in the design -->
        <div class="flex flex-col gap-4 -mb-2">
          <p>{{ $t(fieldsetDescription) }}</p>
          <HelpExpansion :label="$t('label.helpWithFolioOrRefNumbers')">
            <p class="text-center font-bold">
              {{ $t('text.folioHelp.title') }}
            </p>
            <div
              v-for="n in 3"
              :key="n"
              class="space-y-2"
            >
              <p class="font-bold">
                {{ $t(`${helpKey}.q${n}`) }}
              </p>
              <!-- the last answer links to where the default folio is set, in a new tab so the filing is kept -->
              <i18n-t
                v-if="n === 3"
                :keypath="`${helpKey}.a${n}`"
                tag="p"
                scope="global"
              >
                <template #link>
                  <UButton
                    :to="businessEditUrl"
                    target="_blank"
                    variant="link"
                    class="underline p-0 text-base"
                    data-testid="folio-help-edit-link"
                  >
                    {{ $t('label.viewAndChangeBusinessInfo') }}
                  </UButton>
                </template>
              </i18n-t>
              <p v-else>
                {{ $t(`${helpKey}.a${n}`) }}
              </p>
            </div>
          </HelpExpansion>
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
