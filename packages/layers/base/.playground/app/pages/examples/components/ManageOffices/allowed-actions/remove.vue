<script setup lang="ts">
import mockOffices from '#test-mocks/business-addresses/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Offices (Remove)' }]
})

const { tableState } = useManageOffices()

tableState.value = Object.entries(mockOffices).map(([key, value]) => {
  return {
    new: {
      type: key as OfficeType,
      actions: [],
      address: formatBaseAddressUi(value),
      id: ''
    },
    old: {
      type: key as OfficeType,
      actions: [],
      address: formatBaseAddressUi(value),
      id: ''
    }
  }
})

const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
const loading = ref(false)
</script>

<template>
  <UContainer>
    <h1>ManageOffices - Remove</h1>
    <ConnectPageSection
      :heading="{ label: 'ManageOffices - Remove' }"
      ui-body="p-10"
    >
      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No offices'"
        add-label="Add Office"
        edit-label="Edit Office"
        :allowed-actions="[ManageAllowedAction.REMOVE]"
      />
    </ConnectPageSection>
  </UContainer>
</template>
