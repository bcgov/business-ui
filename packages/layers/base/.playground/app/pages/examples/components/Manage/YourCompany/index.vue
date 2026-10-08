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
</script>

<template>
  <UContainer>
    <ManageYourCompany
      v-model:active-subject="activeYourCompany"
      v-model:active-name-translation="activeNameTranslation"
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
    />
  </UContainer>
</template>
