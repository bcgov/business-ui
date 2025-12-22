<script setup lang="ts">
import { ManageAllowedAction } from '#imports'
import mockParties from '#test-mocks/parties/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties (remove)' }]
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
</script>

<template>
  <UContainer>
    <h1>ManageParties - Remove</h1>
    <ConnectPageSection
      :heading="{ label: 'Manage Parties - remove' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        add-label="Add Party"
        edit-label="Edit Party"
        :allowed-actions="[ManageAllowedAction.REMOVE]"
      />
    </ConnectPageSection>
  </UContainer>
</template>
