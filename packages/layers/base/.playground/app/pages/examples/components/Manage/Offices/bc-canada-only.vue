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

const offices = computed(() => formatChangeOfAddressOfficesApi(tableState.value))

// mirrors the apps: the liquidation records office (manage liquidators) needs both addresses in BC, while the
// registered / records offices only need the delivery address in BC - neither delivery address may be a PO Box
const addressFormProps = computed<AddressFormProps>(() => activeOffice.value?.type === OfficeType.LIQUIDATION
  ? { bcCanadaOnly: true, noPoBox: true }
  : { bcCanadaOnly: 'delivery', noPoBox: true })
</script>

<template>
  <UContainer>
    <h1>ManageOffices - BC/Canada Only</h1>
    <ConnectPageSection
      :heading="{ label: 'ManageOffices - BC/Canada Only' }"
      ui-body="p-10"
    >
      <ManageOffices
        v-model:active-subject="activeOffice"
        :loading
        :empty-text="loading ? `Loading...` : 'No offices'"
        subject="Office"
        table-title="Offices"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        :address-form-props
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
