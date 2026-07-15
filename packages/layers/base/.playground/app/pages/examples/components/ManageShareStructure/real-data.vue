<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure - Real Data Example' }]
})

const service = useBusinessService()
const identifier = ref('')
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
      const data = rdSchema.safeParse(d).data!
      return { old: structuredClone(data), new: structuredClone(data) }
    })
    resolutionDates.value = rdMapped

    console.log('RESOLUTIONS: ', rd)
    console.log('RESOLUTIONS MAPPED: ', rdMapped)
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
}>({
  activeClass: undefined,
  activeSeries: undefined,
  activeResolutionDate: undefined
})

onMounted(() => {
  identifier.value = 'BC1230023'
  initData()
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
        </div>
        <ManageShareStructure
          v-model:active-class="formState.activeClass"
          v-model:active-series="formState.activeSeries"
          v-model:active-rd="formState.activeResolutionDate"
          :loading
          subject="Share Class"
        />
      </template>
    </ConnectPageSection>
  </UContainer>
</template>
