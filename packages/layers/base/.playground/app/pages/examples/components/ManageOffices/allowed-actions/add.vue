<script setup lang="ts">
import mockOffices from '#test-mocks/business-addresses/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Offices (add)' }]
})

const { tableState } = useManageOffices()

tableState.value = formatOfficesSection(mockOffices)

const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
const loading = ref(false)
</script>

<template>
  <UContainer>
    <h1>ManageOffices - Add</h1>
    <ConnectPageSection
      :heading="{ label: 'ManageOffices - Add' }"
      ui-body="p-10"
    >
      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No offices'"
        :subject="$t(`officeType.${OfficeType.CUSTODIAL}`)"
        table-title="Offices"
        :allowed-actions="[ManageAllowedAction.ADD]"
        :allow-add-office-type="OfficeType.CUSTODIAL"
      />
    </ConnectPageSection>
  </UContainer>
</template>
