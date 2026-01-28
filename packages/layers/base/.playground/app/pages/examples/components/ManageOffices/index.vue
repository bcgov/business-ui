<script setup lang="ts">
import mockOffices from '#test-mocks/business-addresses/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Offices' }]
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
    <ConnectPageSection
      :heading="{ label: 'Manage Offices - Default' }"
      ui-body="p-10"
    >
      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No offices'"
        add-label="Add Office"
        edit-label="Edit Office"
      />
    </ConnectPageSection>
  </UContainer>
</template>
