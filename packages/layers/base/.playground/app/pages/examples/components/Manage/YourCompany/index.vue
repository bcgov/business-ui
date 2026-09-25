<script setup lang="ts">
import mockBusiness from '#test-mocks/business/json/slim.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Your Company' }, { label: 'Default' }]
})

const stateKey = 'playground-manage-company-name-editable'
const nameTranslationsStateKey = `${stateKey}-nt`

const { state } = useManageYourCompany('manage-your-company')
const { tableState: nameTranslationsTableState } = useManageNameTranslations(nameTranslationsStateKey)

// state.value = {
//   new: { legalName: mockBusiness.legalName, actions: [] },
//   old: { legalName: mockBusiness.legalName, actions: [] }
// }

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

const activeNameRequest = ref<ActiveNameRequestSchema | undefined>(undefined)
const activeNameTranslation = ref<ActiveNameTranslationSchema | undefined>(undefined)
const loading = ref(false)
</script>

<template>
  <UContainer>
    <ManageYourCompany
      v-model:active-name-request="activeNameRequest"
      v-model:active-name-translation="activeNameTranslation"
      :state-key="stateKey"
      :business="business"
      :contact="contact"
      :loading="loading"
      :readonly="false"
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
