<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure - Real Data Example' }]
})

const service = useBusinessService()
const identifier = ref('')
const collectResolutionDate = ref(true)
const loading = ref(false)
const { shareClasses, resolutionDates } = useManageShareStructure()
const rdSchema = getResolutionDateSchema()

async function initData() {
  try {
    loading.value = true
    const sc = await service.getShareClasses(identifier.value)
    const rd = await service.getResolutions(identifier.value)
    shareClasses.value = formatShareClassesUi(sc)

    const rdMapped = rd.map((d) => {
      const data = rdSchema.parse(d)
      return { old: structuredClone(data), new: structuredClone(data) }
    })
    resolutionDates.value = rdMapped
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function reset() {
  shareClasses.value = []
  resolutionDates.value = []
}

const formState = reactive<{
  activeClass: ActiveShareClassSchema | undefined
  activeSeries: ActiveShareSeriesSchema | undefined
  activeResolutionDate: ActiveResolutionDateSchema | undefined
  resolutionDate: ResolutionDateSchema | undefined
}>({
  activeClass: undefined,
  activeSeries: undefined,
  activeResolutionDate: undefined,
  resolutionDate: undefined
})

onMounted(() => {
  identifier.value = 'BC1230023'
  initData()
  formState.resolutionDate = rdSchema.parse({})
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
            @keydown.enter.prevent="initData"
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
          <USwitch v-model="collectResolutionDate" label="Collect Date on Change" />
        </div>
        <ManageShareStructure
          v-model:active-class="formState.activeClass"
          v-model:active-series="formState.activeSeries"
          v-model:active-rd="formState.activeResolutionDate"
          v-model:rd="formState.resolutionDate"
          :loading
          subject="Share Class"
          variant="correct"
          :collect-resolution-date="collectResolutionDate"
        />
      </template>
    </ConnectPageSection>
  </UContainer>
</template>
