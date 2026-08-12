<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Court Orders' }]
})

const service = useBusinessService()

onMounted(async () => {
  const data = await service.getCourtOrders('BC0878506')
  console.log('COURT ORDERS: ', data)
})

const exampleData: TableBusinessState<CourtOrderPoaFullSchema>[] = [
  {
    new: {
      isEditing: false,
      actions: [],
      id: '12345',
      courtOrderNumber: 'TT1234567890',
      hasPoa: false,
      courtOrderText: 'Some court order text here',
      filingType: FilingType.RESTORATION,
      filingId: 1234,
      files: []
    },
    old: {
      isEditing: false,
      actions: [],
      id: '12345',
      courtOrderNumber: 'TT1234567890',
      hasPoa: false,
      courtOrderText: 'Some court order text here',
      filingType: FilingType.RESTORATION,
      filingId: 1234,
      files: []
    }
  }
]
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Court Orders - Default' }"
      ui-body="p-10"
    >
      <TableCourtOrder :data="exampleData" />
    </ConnectPageSection>
  </UContainer>
</template>
