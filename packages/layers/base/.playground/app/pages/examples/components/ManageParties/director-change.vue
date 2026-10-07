<script setup lang="ts">
import mockParties from '#test-mocks/parties/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties (director change)' }]
})

const { tableState } = useManageParties()
const parties = mockParties.map((p) => {
  return {
    // @ts-expect-error - party type enum/string mismatch
    new: formatPartyUi(p, RoleType.DIRECTOR),
    // @ts-expect-error - party type enum/string mismatch
    old: formatPartyUi(p, RoleType.DIRECTOR)
  }
})
tableState.value = parties

const activeParty = ref<ActivePartySchema | undefined>(undefined)
const loading = ref(false)

const directorChangeProps = getDirectorChangeManagePartiesProps()

// coop config - min 3 directors, BC + Canadian residency soft warnings
const warning = computed(() => getDirectorWarning(tableState.value, {
  minCount: 3,
  bcResidency: true,
  canadianResidency: true
}))

const relationships = computed(() => buildChangeOfDirectorsRelationships(tableState.value))
</script>

<template>
  <UContainer>
    <h1>ManageParties - Director Change</h1>
    <UAlert
      v-if="warning"
      type="info"
      color="warning"
      variant="subtle"
      icon="i-mdi-alert"
      :description="warning.message"
      data-testid="director-warning"
      class="my-4"
    />
    <ConnectPageSection
      :heading="{ label: 'Manage Parties - Director Change' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        v-bind="directorChangeProps"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No directors'"
        table-title="Directors"
        subject="Director"
      />
    </ConnectPageSection>
    <ConnectPageSection
      :heading="{ label: 'Relationships payload (changed rows only)' }"
      ui-body="p-10"
      class="mt-4"
    >
      <pre data-testid="relationships-payload">{{ JSON.stringify(relationships, null, 2) }}</pre>
    </ConnectPageSection>
  </UContainer>
</template>
