<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Name Translations' }, { label: 'Readonly' }]
})

const exampleLinks = [
  { label: 'Default', to: '/examples/components/Manage/NameTranslations', exact: true },
  { label: 'Correct', to: '/examples/components/Manage/NameTranslations/correct' },
  { label: 'Readonly', to: '/examples/components/Manage/NameTranslations/readonly' }
]

const stateKey = 'manage-name-translations-readonly'

const { tableState } = useManageNameTranslations(stateKey)

tableState.value = formatNameTranslationsSection([
  { id: '1', name: 'Entreprise Exemple' },
  { id: '2', name: 'Exemple Société' }
])

const activeNameTranslation = ref<ActiveNameTranslationSchema | undefined>(undefined)
</script>

<template>
  <UContainer>
    <UNavigationMenu :items="exampleLinks" class="mb-4" />
    <ConnectPageSection
      :heading="{ label: 'Manage Name Translations - Readonly' }"
      ui-body="p-10"
    >
      <ManageNameTranslations
        v-model:active-subject="activeNameTranslation"
        :state-key
        variant="readonly"
      />
    </ConnectPageSection>
  </UContainer>
</template>
