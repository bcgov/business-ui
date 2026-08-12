<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Court Orders' }]
})

const schema = getCourtOrderPoaFullSchema()
const service = useBusinessService()
const data = ref<TableBusinessState<CourtOrderPoaFullSchema>[]>([])

onMounted(async () => {
  const courtOrders = await service.getCourtOrders('BC0878506')
  const mapped = courtOrders.map((co) => {
    const parsed = schema.parse(co)
    return { old: structuredClone(parsed), new: structuredClone(parsed) }
  })
  data.value = mapped
})
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Court Orders - Default' }"
      ui-body="p-10"
    >
      <TableCourtOrder :data="data" />
    </ConnectPageSection>
  </UContainer>
</template>
