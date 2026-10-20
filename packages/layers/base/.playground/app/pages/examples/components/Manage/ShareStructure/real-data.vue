<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure - Real Data Example' }]
})

const { isAuthenticated } = useConnectAuth()
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
    shareClasses.value = formatShareClassesSection(sc)
    resolutionDates.value = formatResolutionDatesSection(rd).tableState
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
  activeSubject: ActiveShareStructureSchema
  resolutionDate: ResolutionDateSchema | undefined
}>({
  activeSubject: undefined,
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
          v-if="!isAuthenticated"
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
          v-model:active-subject="formState.activeSubject"
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
