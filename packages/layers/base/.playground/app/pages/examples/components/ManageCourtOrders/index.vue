<script setup lang="ts">
import { delay } from 'es-toolkit'
import mockCourtOrders from '#test-mocks/business-court-orders/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Court Orders' }]
})

const schema = getCourtOrderPoaFullSchema()
const { tableState } = useManageCourtOrders()

const activeCourtOrder = ref<ActiveCourtOrderPoaFullSchema | undefined>(undefined)
const loading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    await delay(1500)
    const mapped = mockCourtOrders.courtOrders.map((co) => {
      const parsed = schema.parse(co)
      return { old: structuredClone(parsed), new: structuredClone(parsed) }
    })
    tableState.value = mapped
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
        :loading
      />
    </ConnectPageSection>
  </UContainer>
</template>
