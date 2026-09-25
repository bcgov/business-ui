<script setup lang="ts">
import mockParties from '#test-mocks/parties/json/with-ceased-director.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties - With Ceased Director' }]
})

const { tableState } = useManageParties()
const { tableState: noCeasedTableState } = useManageParties('manage-parties-no-ceased')
const { tableState: noTabTableState } = useManageParties('manage-parties-no-tab')

function toTableState(json: typeof mockParties) {
  return json.map((p) => {
    return {
      // @ts-expect-error - party type enum/string mismatch
      new: formatPartyUi(p, undefined),
      // @ts-expect-error - party type enum/string mismatch
      old: formatPartyUi(p, undefined)
    }
  })
}

// ceased directors only apply to corrections, so the consumer filters them out when it doesn't need them
const activeMockParties = mockParties.filter(p => p.roles.every(r => !r.cessationDate))

tableState.value = toTableState(mockParties)
// same directors minus the ceased ones - the ceased tab still shows (it's configured for the role) but is empty
noCeasedTableState.value = toTableState(activeMockParties)
// outside of a correction there's no ceased tab, so only the active directors are passed in
noTabTableState.value = toTableState(activeMockParties)

const activeParty = ref<ActivePartySchema | undefined>(undefined)
const noCeasedActiveParty = ref<ActivePartySchema | undefined>(undefined)
const noTabActiveParty = ref<ActivePartySchema | undefined>(undefined)
const loading = ref(false)

const allowedActions = [
  ManageAllowedAction.ADD,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.EMAIL_CHANGE,
  ManageAllowedAction.EFFECTIVE_DATE_CHANGE,
  ManageAllowedAction.CESSATION_DATE_CHANGE,
  ManageAllowedAction.REMOVE
]
const columnsToDisplay: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'roles', 'effectiveDates', 'actions']
// no partyRoleProps - the role is always Director (from role-type), so there's no role selection
const partyFormProps = {
  partyNameProps: { allowBusinessName: true, allowPreferredName: true }
}
</script>

<template>
  <UContainer class="space-y-10">
    <ConnectPageSection
      :heading="{ label: 'Manage Parties - With Ceased Director' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="activeParty"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        table-title="Directors"
        subject="Director"
        variant="correct"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="allowedActions"
        :columns-to-display="columnsToDisplay"
        :party-form-props="partyFormProps"
      />
    </ConnectPageSection>

    <ConnectPageSection
      :heading="{ label: 'Manage Parties - With No Ceased Director' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="noCeasedActiveParty"
        state-key="manage-parties-no-ceased"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        table-title="Directors"
        subject="Director"
        variant="correct"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="allowedActions"
        :columns-to-display="columnsToDisplay"
        :party-form-props="partyFormProps"
      />
    </ConnectPageSection>

    <ConnectPageSection
      :heading="{ label: 'Manage Parties - Not Correcting (No Ceased Tab)' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-party="noTabActiveParty"
        state-key="manage-parties-no-tab"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No parties'"
        table-title="Directors"
        subject="Director"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="allowedActions"
        :columns-to-display="columnsToDisplay"
        :party-form-props="partyFormProps"
      />
    </ConnectPageSection>
  </UContainer>
</template>
