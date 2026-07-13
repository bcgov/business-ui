<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure - Real Data Example' }]
})

const service = useBusinessService()
const identifier = ref('')
const loading = ref(false)
const { tableState } = useManageShareStructure()

async function initData() {
  try {
    loading.value = true
    const sc = await service.getShareClasses(identifier.value)
    const r = await service.getResolutions(identifier.value)
    tableState.value = formatShareClassesUi(sc)

    console.log('RESOLUTIONS: ', r)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function reset() {
  tableState.value = []
}

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
      :heading="{ label: 'Manage Share Structure - Real Data Example' }"
      ui-body="p-10 space-y-10"
    >
      <template #default>
        <UAlert
          v-if="!$connectAuth.authenticated"
          title="This example requires authentication and a business affiliated to your current account."
          color="error"
          icon="i-mdi-alert"
        />
        <div class="flex gap-4">
          <ConnectInput
            id="b-id"
            v-model="identifier"
            label="Business Identifier"
          />
          <UButton
            label="Go"
            :loading
            @click="initData"
          />
          <UButton
            label="Reset"
            :loading
            @click="reset"
          />
        </div>
        <ManageShareStructure
          v-model:active-class="formState.activeClass"
          v-model:active-series="formState.activeSeries"
          :loading
          subject="Share Class"
        />
      </template>
    </ConnectPageSection>
  </UContainer>
</template>
