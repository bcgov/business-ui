<script setup lang="ts">
import { ManageAllowedAction } from '#imports'
import mockParties from '#test-mocks/parties/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties (edits)' }]
})

const { tableState } = useManageParties()
const parties = mockParties.map((p) => {
  return {
    // @ts-expect-error - party type enum/string mismatch
    new: formatPartyUi(p, undefined),
    // @ts-expect-error - party type enum/string mismatch
    old: formatPartyUi(p, undefined)
  }
})
tableState.value = parties

const activeParty = ref<ActivePartySchema | undefined>(undefined)
const loading = ref(false)
const selectItems = ref([
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.ROLE_CHANGE
])
const selectedItems = ref([
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.ROLE_CHANGE
])
</script>

<template>
  <UContainer>
    <h1>ManageParties - Edits</h1>
    <div class="p-4 bg-white sm:max-w-1/4">
      <ConnectSelect
        id="allowed-changes-select"
        v-model="selectedItems"
        class="w-full"
        label="Select Allowed Changes"
        :items="selectItems"
        multiple
      />
    </div>
    <ConnectPageSection
      :heading="{ label: 'Manage Parties - Edits' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        add-label="Add Party"
        edit-label="Edit Party"
        :allowed-actions="selectedItems"
      />
    </ConnectPageSection>
  </UContainer>
</template>
