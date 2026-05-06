<script setup lang="ts">
import mockBusiness from '#test-mocks/business/json/slim.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Company Name' }]
})

const stateKey = 'playground-manage-company-name'
const nameTranslationsStateKey = `${stateKey}-name-translations`

const { state } = useManageCompanyName(stateKey)
const { tableState: nameTranslationsTableState } = useManageNameTranslations(nameTranslationsStateKey)

state.value = {
  new: { legalName: mockBusiness.legalName, actions: [] },
  old: { legalName: mockBusiness.legalName, actions: [] }
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
    <ManageCompanyName
      v-model:active-name-request="activeNameRequest"
      v-model:active-name-translation="activeNameTranslation"
      :state-key="stateKey"
      :business="business"
      :contact="contact"
      :loading="loading"
      :readonly="true"
      :name-translation-allowed-actions="[
        ManageAllowedAction.ADD,
        ManageAllowedAction.NAME_CHANGE,
        ManageAllowedAction.REMOVE
      ]"
    />
  </UContainer>
</template>
