<script setup lang="ts">
import mockClasses from '#test-mocks/business-share-classes/json/currency-other.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure (currency other)' }]
})

const { tableState } = useManageShareStructure()
tableState.value = formatShareClassesUi(mockClasses.shareClasses)

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
      :heading="{ label: 'Manage Share Structure - Currency Other' }"
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
