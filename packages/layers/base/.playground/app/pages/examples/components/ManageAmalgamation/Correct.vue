<script setup lang="ts">
import { delay } from 'es-toolkit'
import mockAmal from '#test-mocks/business-extended/json/amalgamationApplication/for-correction.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Amalgamation - Correct' }]
})

const { tableState, statementState } = useManageAmalgamation()
const activeAmal = ref<ActiveAmalgamationCorrectSchema | undefined>(undefined)
const activeAmalStmnt = ref<ActiveAmalgamationCorrectStatementSchema | undefined>(undefined)
const loading = ref(false)

onMounted(async () => {
  try {
    tableState.value = []
    loading.value = true
    await delay(1500)
    const formatted = formatAmalCorrectSection(mockAmal.amalgamation as Amalgamation)
    tableState.value = formatted.tableState
    statementState.value = formatted.statementState
  } catch {
    // should never happen
    console.error('Error initializing mock data')
  } finally {
    loading.value = false
  }
})

const variant = ref<ManageVariant>('correct')
</script>

<template>
  <UContainer>
    <ConnectPageSection ui-body="p-10">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-semibold text-neutral-highlighted text-base">Manage Amalgamation - Correct</span>
          <ConnectSelect
            id="variant-select"
            v-model="variant"
            label="Select Variant"
            :items="['default', 'readonly', 'correct', 'correct-readonly']"
            class="w-48"
          />
        </div>
      </template>
      <template #default>
        <ManageAmalgamation
          v-model:active-amal="activeAmal"
          v-model:active-amal-stmnt="activeAmalStmnt"
          :variant
          :loading
        />
      </template>
    </ConnectPageSection>
  </UContainer>
</template>
