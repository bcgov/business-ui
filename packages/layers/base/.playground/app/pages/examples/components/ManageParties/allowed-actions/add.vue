<script setup lang="ts">
import { ManageAllowedAction } from '#imports'
import mockParties from '#test-mocks/parties/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties (add)' }]
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
    <ConnectPageSection
      :heading="{ label: 'Manage Parties - Add' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        add-label="Add Party"
        edit-label="Edit Party"
        :allowed-actions="[ManageAllowedAction.ADD]"
      />
    </ConnectPageSection>
  </UContainer>
</template>
