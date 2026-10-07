<script setup lang="ts">
import mockOffices from '#test-mocks/business-addresses/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Offices (BC/Canada only)' }]
})

const { tableState } = useManageOffices()

tableState.value = formatOfficesSection(mockOffices)

const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
const loading = ref(false)

const offices = computed(() => buildChangeOfAddressOffices(tableState.value))
</script>

<template>
  <UContainer>
    <h1>ManageOffices - BC/Canada Only</h1>
    <ConnectPageSection
      :heading="{ label: 'ManageOffices - BC/Canada Only' }"
      ui-body="p-10"
    >
      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No offices'"
        subject="Office"
        table-title="Offices"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        bc-canada-only
      />
    </ConnectPageSection>
    <ConnectPageSection
      :heading="{ label: 'Offices payload' }"
      ui-body="p-10"
      class="mt-4"
    >
      <pre data-testid="offices-payload">{{ JSON.stringify(offices, null, 2) }}</pre>
    </ConnectPageSection>
  </UContainer>
</template>
