<script setup lang="ts">
import mockClasses from '#test-mocks/business-share-classes/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure' }]
})

const { tableState } = useManageShareStructure()
tableState.value = mockClasses.shareClasses.map((c) => {
  return {
    new: {
      ...c,
      actions: [],
      id: c.id.toString(),
      series: c.series.map(s => ({
        ...s,
        id: s.id.toString(),
        actions: []
      }))
    },
    old: {
      ...c,
      actions: [],
      id: c.id.toString(),
      series: c.series.map(s => ({
        ...s,
        id: s.id.toString(),
        actions: []
      }))
    }
  }
})

const activeClass = ref<ActiveShareClassSchema | undefined>(undefined)
const activeSeries = ref<ActiveShareSeriesSchema | undefined>(undefined)
const loading = ref(false)
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Share Structure - Default' }"
      ui-body="p-10"
    >
      <ManageShareStructure
        v-model:active-class="activeClass"
        v-model:active-series="activeSeries"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No classes'"
        add-label="Add Share Class"
        edit-label="Edit Class or series?"
      />
    </ConnectPageSection>
  </UContainer>
</template>
