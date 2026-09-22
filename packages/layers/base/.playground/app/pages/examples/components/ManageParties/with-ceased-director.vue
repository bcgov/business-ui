<script setup lang="ts">
import mockParties from '#test-mocks/parties/json/with-ceased-director.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties - With Ceased Director' }]
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
      :heading="{ label: 'Manage Parties - With Ceased Director' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        table-title="Parties"
        subject="Party"
        :allowed-actions="[
          ManageAllowedAction.NAME_CHANGE,
          ManageAllowedAction.ADDRESS_CHANGE,
          ManageAllowedAction.EMAIL_CHANGE,
          ManageAllowedAction.EFFECTIVE_DATE_CHANGE,
          ManageAllowedAction.CESSATION_DATE_CHANGE,
          ManageAllowedAction.REMOVE
        ]"
        :columns-to-display="['name', 'mailing', 'delivery', 'roles', 'effectiveDates', 'actions']"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: true },
          partyRoleProps: { allowedRoles: [RoleTypeUi.DIRECTOR] }
        }"
      />
    </ConnectPageSection>
  </UContainer>
</template>
