<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Parties - Liquidator' }]
})

// the liquidator role renders FormLiquidatorDetails (appointment method + effective date) instead of FormPartyDetails
const { tableState } = useManageParties('manage-liquidators')
tableState.value = []

const activeParty = ref<ActivePartySchema | undefined>(undefined)
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Parties - Liquidator' }"
      ui-body="p-10"
    >
      <ManageParties
        v-model:active-subject="activeParty"
        state-key="manage-liquidators"
        empty-text="No liquidators"
        table-title="Liquidators"
        subject="Liquidator"
        :role-type="RoleTypeUi.LIQUIDATOR"
        :allowed-actions="[ManageAllowedAction.ADD]"
        :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: false }
        }"
      />
    </ConnectPageSection>
  </UContainer>
</template>
