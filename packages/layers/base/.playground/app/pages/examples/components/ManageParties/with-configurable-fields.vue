<script setup lang="ts">
import mockParties from '#test-mocks/parties/json/with-configurable-fields.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties - With Configurable Fields' }]
})

const { tableState } = useManageParties()

const allowedRoles = [
  RoleTypeUi.CUSTODIAN,
  RoleTypeUi.DIRECTOR,
  RoleTypeUi.APPLICANT
]

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
      :heading="{ label: 'Manage Parties - With Configurable Fields' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        table-title="Parties"
        subject="Party"
        :columns-to-display="['name', 'mailing', 'delivery', 'roles', 'effectiveDates', 'actions']"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: true },
          partyRoleProps: { allowedRoles }
        }"
      />
    </ConnectPageSection>
  </UContainer>
</template>
