<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Name Translations' }, { label: 'Correct' }]
})

const exampleLinks = [
  { label: 'Default', to: '/examples/components/Manage/NameTranslations', exact: true },
  { label: 'Correct', to: '/examples/components/Manage/NameTranslations/correct' },
  { label: 'Readonly', to: '/examples/components/Manage/NameTranslations/readonly' }
]

const stateKey = 'manage-name-translations-correct'

const { tableState } = useManageNameTranslations(stateKey)

// originals from the business, merged with a resumed draft to show each action badge
const originals: NameTranslation[] = [
  { id: '1', name: 'Entreprise Exemple' },
  { id: '2', name: 'Exemple Société' },
  { id: '3', name: 'Nom Inchangé' }
]
const draft: NameTranslation[] = [
  { name: 'Nouvelle Traduction' }, // added
  { id: '1', name: 'Entreprise Exemple Corrigée' }, // corrected
  { id: '3', name: 'Nom Inchangé' } // unchanged, id 2 omitted -> removed
]

tableState.value = formatNameTranslationsSection(originals, draft)

const activeNameTranslation = ref<ActiveNameTranslationSchema | undefined>(undefined)
const loading = ref(false)
</script>

<template>
  <UContainer>
    <UNavigationMenu :items="exampleLinks" class="mb-4" />
    <ConnectPageSection
      :heading="{ label: 'Manage Name Translations - Correct' }"
      ui-body="p-10"
    >
      <ManageNameTranslations
        v-model:active-subject="activeNameTranslation"
        :state-key
        :loading
        variant="correct"
        :empty-text="loading ? `Loading...` : 'No name translations'"
      />
    </ConnectPageSection>
  </UContainer>
</template>
