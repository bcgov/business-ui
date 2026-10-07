<script setup lang="ts">
import type { FormError, Form, InputMenuItem } from '@nuxt/ui'

defineProps<{
  name?: string
  order?: string | number
  description?: string
}>()

const { t } = useI18n()

const schema = getForeignJurisdictionSchema()

const model = defineModel<ForeignJurisdictionSchema>({ required: true })

const formRef = useTemplateRef<Form<ForeignJurisdictionSchema>>('foreign-jurisdiction-form')

const formErrors = computed<{
  country: FormError | undefined
  region: FormError | undefined
}>(() => {
  const errors = formRef.value?.getErrors()
  return {
    country: errors?.find(e => e.name === 'country'),
    region: errors?.find(e => e.name === 'region')
  }
})

type JurisdictionMenuItem = InputMenuItem & { label?: string, code?: string }

// Canada and the US pinned first
const countryItems: JurisdictionMenuItem[] = [
  { label: isoCountriesListSortedByName.find(c => c.alpha_2 === 'CA')!.name, code: 'CA' },
  { label: isoCountriesListSortedByName.find(c => c.alpha_2 === 'US')!.name, code: 'US' },
  { type: 'separator' },
  ...isoCountriesListSortedByName
    .filter(c => c.alpha_2 !== 'CA' && c.alpha_2 !== 'US')
    .map(c => ({ label: c.name, code: c.alpha_2 }))
]

// CA: provinces/territories minus BC, plus Federal; US: states. No region for other countries.
const regionItems = computed<JurisdictionMenuItem[]>(() => {
  if (model.value.country === 'CA') {
    return [
      ...countrySubdivisions.ca
        .filter(p => p.code !== 'BC')
        .map(p => ({ label: p.name, code: p.code })),
      { type: 'separator' },
      { label: t('label.federal'), code: 'FEDERAL' }
    ]
  }
  if (model.value.country === 'US') {
    return countrySubdivisions.us.map(s => ({ label: s.name, code: s.code }))
  }
  return []
})

const showRegion = computed(() => model.value.country === 'CA' || model.value.country === 'US')

const selectedCountry = computed({
  get: (): JurisdictionMenuItem | undefined =>
    countryItems.find(i => 'code' in i && i.code === model.value.country),
  set: (item: JurisdictionMenuItem | undefined) => {
    const country = item?.code ?? ''
    if (country !== model.value.country) {
      // any previous region never applies to the new country
      model.value = { country, region: '' }
      formRef.value?.clear()
    }
  }
})

const selectedRegion = computed({
  get: (): JurisdictionMenuItem | undefined =>
    regionItems.value.find(i => 'code' in i && i.code === model.value.region),
  set: (item: JurisdictionMenuItem | undefined) => {
    model.value = { ...model.value, region: item?.code ?? '' }
    formRef.value?.clear('region')
  }
})

defineExpose({
  formRef
})
</script>

<template>
  <!-- nested forms resolve their state from the parent form via `name` (DocumentDelivery pattern) -->
  <UForm
    ref="foreign-jurisdiction-form"
    data-testid="foreign-jurisdiction-section"
    :schema
    :name
    nested
  >
    <ConnectFieldset
      :label="order ? `${order}. ${$t('label.jurisdiction')}` : $t('label.jurisdiction')"
      :description="description"
      body-variant="card"
      orientation="vertical"
    >
      <div class="flex flex-col gap-6 py-6">
        <ConnectFormFieldWrapper
          :label="$t('label.jurisdictionCountry')"
          orientation="horizontal"
          :error="formErrors.country"
        >
          <ConnectInputMenu
            id="jurisdiction-country-menu"
            v-model="selectedCountry"
            :label="$t('label.jurisdictionCountry')"
            :items="countryItems"
            open-on-focus
            class="w-full"
            :aria-invalid="!!formErrors.country"
            data-testid="jurisdiction-country"
          />
        </ConnectFormFieldWrapper>
        <ConnectFormFieldWrapper
          v-if="showRegion"
          :label="$t('label.jurisdictionRegion')"
          orientation="horizontal"
          :error="formErrors.region"
        >
          <ConnectInputMenu
            id="jurisdiction-region-menu"
            v-model="selectedRegion"
            :label="$t('label.jurisdictionRegion')"
            :items="regionItems"
            open-on-focus
            class="w-full"
            :aria-invalid="!!formErrors.region"
            data-testid="jurisdiction-region"
          />
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
