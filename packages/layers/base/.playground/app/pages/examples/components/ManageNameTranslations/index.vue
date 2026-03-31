<script setup lang="ts">
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Name Translations' }]
})

const stateKey = 'playground-manage-name-translations'
const { tableState } = useManageNameTranslations(stateKey)

tableState.value = [
  {
    name: 'Entreprise Exemple',
    new: true
  },
  {
    name: 'Example Company',
    ceased: true
  },
  {
    name: 'Exemple Société'
  }
].map((nt) => {
  const base = {
    name: nt.name,
    isEditing: false,
    actions: [] as ActionType[],
    id: crypto.randomUUID()
  }

  // newest (new=true) → newly added, no old state
  if (nt.new) {
    return {
      new: { ...base, actions: [ActionType.ADDED] },
      old: undefined
    }
  }

  // oldest (ceased=true) → removed, has old state
  if (nt.ceased) {
    return {
      new: { ...base, actions: [ActionType.REMOVED] },
      old: { ...base }
    }
  }

  // unchanged → same old and new
  return {
    new: base,
    old: { ...base }
  }
})

const activeNameTranslation = ref<ActiveNameTranslationSchema | undefined>(undefined)
const loading = ref(false)
const { t } = useI18n()
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Name Translations - Default' }"
      ui-body="p-10"
    >
      <ManageNameTranslations
        v-model:active-name-translation="activeNameTranslation"
        :state-key="stateKey"
        :loading="loading"
        :empty-text="loading ? 'Loading...' : t('label.noNameTranslations')"
        add-label="Add Name Translation"
        :allowed-actions="[ManageAllowedAction.ADD, ManageAllowedAction.NAME_CHANGE, ManageAllowedAction.REMOVE]"
      />
    </ConnectPageSection>
  </UContainer>
</template>
