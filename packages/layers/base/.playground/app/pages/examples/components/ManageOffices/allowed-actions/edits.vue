<script setup lang="ts">
import mockOffices from '#test-mocks/business-addresses/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Offices (edits)' }]
})

const { tableState } = useManageOffices()

tableState.value = formatOfficesSection(mockOffices)

const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
const loading = ref(false)
</script>

<template>
  <UContainer>
    <h1>ManageOffices - Edits</h1>
    <ConnectPageSection
      :heading="{ label: 'ManageOffices - Edits' }"
      ui-body="p-10"
    >
      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No offices'"
        subject="Office"
        table-title="Offices"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      />
    </ConnectPageSection>
  </UContainer>
</template>
