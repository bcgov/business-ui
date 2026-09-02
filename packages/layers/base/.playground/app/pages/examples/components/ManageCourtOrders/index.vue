<script setup lang="ts">
import { delay } from 'es-toolkit'
import mockCourtOrders from '#test-mocks/business-court-orders/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Court Orders' }]
})

const { tableState } = useManageCourtOrders()

const activeCourtOrder = ref<ActiveCourtOrderPoaFullSchema | undefined>(undefined)
const loading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    await delay(1500)
    tableState.value = formatCourtOrdersSection(mockCourtOrders.courtOrders as unknown as CourtOrderResponse[])
  } catch {
    // should never happen
    console.error('Error initializing mock data')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Court Orders - Default' }"
      ui-body="p-10"
    >
      <ManageCourtOrders
        v-model:active-co="activeCourtOrder"
        :entity-type="CorpTypeCd.BC_COMPANY"
        identifier="BC1234567"
        :loading
      />
    </ConnectPageSection>
  </UContainer>
</template>
