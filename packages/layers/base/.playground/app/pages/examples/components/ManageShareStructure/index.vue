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
      name: c.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim(),
      id: c.id.toString(),
      series: c.series.map(s => ({
        ...s,
        id: s.id.toString(),
        actions: [],
        isInvalid: false,
        name: s.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim()
      }))
    },
    old: {
      ...c,
      actions: [],
      id: c.id.toString(),
      name: c.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim(),
      series: c.series.map(s => ({
        ...s,
        id: s.id.toString(),
        actions: [],
        isInvalid: false,
        name: s.name.replace(/\s*\b(shares|share|value)\b/gi, '').trim()
      }))
    }
  }
})

const loading = ref(false)

const formState = reactive<{
  activeClass: ActiveShareClassSchema | undefined
  activeSeries: ActiveShareSeriesSchema | undefined
}>({
  activeClass: undefined,
  activeSeries: undefined
})
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Share Structure - Default' }"
      ui-body="p-10"
    >
      <ManageShareStructure
        v-model:active-class="formState.activeClass"
        v-model:active-series="formState.activeSeries"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No classes'"
        add-label="Add Share Class"
        edit-label="Edit Class or series?"
      />
    </ConnectPageSection>
  </UContainer>
</template>
