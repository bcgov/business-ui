<script setup lang="ts">
import mockBusiness from '#test-mocks/business/json/slim.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Your Company' }, { label: 'Default' }]
})

const stateKey = 'manage-your-company'
const nameTranslationsStateKey = `${stateKey}-nt`

const { state } = useManageYourCompany('manage-your-company')
const { tableState: nameTranslationsTableState } = useManageNameTranslations(nameTranslationsStateKey)

state.value = {
  new: {
    nameRequest: {
      value: { legalName: mockBusiness.legalName, nrNumber: '', changeToNumbered: false },
      actions: []
    },
    legalType: {
      value: mockBusiness.legalType as CorpTypeCd,
      actions: []
    },
    nameNewJurisdiction: {
      value: 'NEW 0887699 B.C. LTD.',
      actions: []
    },
    namePreviousJurisdiction: {
      value: 'PREVIOUS 0887699 B.C. LTD.',
      actions: []
    },
    newJurisdiction: {
      value: { country: 'CA', region: 'AB' },
      actions: []
    },
    previousJurisdiction: {
      value: { country: 'US', region: null },
      actions: []
    },
    numberExpro: {
      value: 'EXPRO-123456',
      actions: []
    },
    numberPreviousJurisdiction: {
      value: 'PREV-JUR-123456',
      actions: []
    },
    outDate: {
      value: '2024-10-23',
      actions: []
    }
  },
  old: {
    nameRequest: {
      value: { legalName: mockBusiness.legalName, nrNumber: '', changeToNumbered: false },
      actions: []
    },
    legalType: {
      value: mockBusiness.legalType as CorpTypeCd,
      actions: []
    },
    nameNewJurisdiction: {
      value: '0887699 B.C. LTD.',
      actions: []
    },
    newJurisdiction: {
      value: { country: 'CA', region: 'AB' },
      actions: []
    },
    previousJurisdiction: {
      value: { country: 'US', region: null },
      actions: []
    },
    outDate: {
      value: '2024-10-23',
      actions: []
    }
  }
}

nameTranslationsTableState.value = [
  { name: 'Entreprise Exemple' },
  { name: 'Exemple Société' }
].map(({ name }) => {
  const base = { name, isEditing: false, actions: [] as ActionType[], id: crypto.randomUUID() }
  return { new: base, old: { ...base } }
})

const business = mockBusiness as BusinessDataPublic

const contact: ContactPoint = {
  email: 'test@example.com',
  phone: '250-555-1234'
}

const activeNameTranslation = ref<ActiveNameTranslationSchema | undefined>(undefined)
const activeYourCompany = ref<ActiveYourCompanySchema>(undefined)
const loading = ref(false)

const items = ['default', 'readonly', 'hide']
const configState = reactive<NonNullable<ManageYourCompanyProps['fieldOverrides']>>({})
</script>

<template>
  <UContainer class="flex flex-col">
    <ConnectPageSection :heading="{ label: 'Section Config' }">
      <div class="flex gap-2 p-2">
        <div class="flex flex-col gap-4">
          <h3>Company Name</h3>
          <URadioGroup
            v-model="configState.nameRequest"
            legend="Name Request"
            :items
          />
          <URadioGroup
            v-model="configState.nameNewJurisdiction"
            legend="Name in new Jurisdiction"
            :items
          />
          <URadioGroup
            v-model="configState.namePreviousJurisdiction"
            legend="Name in previous Jurisdiction"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Name Translations</h3>
          <URadioGroup
            v-model="configState.nameTranslations"
            legend="Name Translations"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Expro Number</h3>
          <URadioGroup
            v-model="configState.numberExpro"
            legend="Expro # in B.C."
            :items
          />
          <URadioGroup
            v-model="configState.numberPreviousJurisdiction"
            legend="Identifying Number"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Business Type</h3>
          <URadioGroup
            v-model="configState.legalType"
            legend="Business Type"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Recognition Date and Time</h3>
          <URadioGroup
            v-model="configState.foundingDate"
            legend="Recognition Date and Time"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Date Of Cont/Amal Out</h3>
          <URadioGroup
            v-model="configState.outDate"
            legend="Date Of Cont/Amal Out"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Jurisdiction</h3>
          <URadioGroup
            v-model="configState.jurisdiction"
            legend="Jurisdiction"
            :items
          />
          <URadioGroup
            v-model="configState.newJurisdiction"
            legend="New Jurisdiction"
            :items
          />
          <URadioGroup
            v-model="configState.previousJurisdiction"
            legend="Previous Jurisdiction"
            :items
          />
        </div>
        <div class="flex flex-col gap-4">
          <h3>Contact Info</h3>
          <URadioGroup
            v-model="configState.contactInfo"
            legend="Contact Info"
            :items
          />
        </div>
      </div>
    </ConnectPageSection>
    <ManageYourCompany
      v-model:active-subject="activeYourCompany"
      v-model:active-nt="activeNameTranslation"
      data-testid="your-company-section"
      :state-key
      :business
      :contact
      :loading
      variant="correct"
      :correct-name-options="[CorrectNameOption.CORRECT_NAME]"
      :nr-allowed-actions-types="[NrRequestActionCode.CHANGE_NAME]"
      :name-translation-allowed-actions="[
        ManageAllowedAction.ADD,
        ManageAllowedAction.NAME_CHANGE,
        ManageAllowedAction.REMOVE
      ]"
      :field-overrides="configState"
    />
  </UContainer>
</template>
