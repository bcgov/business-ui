<script setup lang="ts">
import { computed, ref } from 'vue'

const store = useCorrectionStore()
const { business, businessContact } = storeToRefs(useBusinessStore())
const partyColumns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'effectiveDates', 'actions']

const globalPreventActions = computed(() => {
  return !!store.formState.activeNameRequest
    || !!store.formState.activeNameTranslation
    || !!store.formState.activeOffice
    || !!store.formState.activeDirector
    || !!store.formState.activeReceiver
    || !!store.formState.activeLiquidator
    || !!store.formState.activeClass
    || !!store.formState.activeSeries
})

// transient signal for child-initiated prevented actions
const actionPreventedSignal = ref(0)
function onActionPrevented() {
  actionPreventedSignal.value++
}
</script>

<template>
  <UForm
    ref="correction-form-step-1"
    :state="store.formState"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onFormSubmitError"
  >
    <ManageCompanyName
      v-model:active-name-request="store.formState.activeNameRequest"
      v-model:active-name-translation="store.formState.activeNameTranslation"
      :loading="store.initializing"
      :business
      :contact="businessContact"
      :correct-name-options="getCorrectNameOptionsForCorpType(business?.legalType)"
      :nr-allowed-actions-types="FILING_NR_ALLOWED_ACTIONS[FilingType.CORRECTION]"
      :prevent-actions="globalPreventActions"
      variant="correct"
      :action-prevented-signal="actionPreventedSignal"
      @action-prevented="onActionPrevented"
    />

    <ManageOffices
      v-model:active-office="store.formState.activeOffice"
      data-testid="office-addresses-section"
      :loading="store.initializing"
      :empty-text="$t('label.noOffices')"
      :table-title="$t('label.officeAddresses')"
      subject=""
      variant="correct"
      :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      :prevent-actions="globalPreventActions"
      :action-prevented-signal="actionPreventedSignal"
      @action-prevented="onActionPrevented"
    />

    <ManageParties
      v-model:active-party="store.formState.activeDirector"
      :loading="store.initializing"
      :empty-text="$t('label.noDirectors')"
      :table-title="$t('label.currentDirectors')"
      :subject="$t('label.director')"
      :columns-to-display="partyColumns"
      data-testid="current-directors-section"
      :role-type="RoleTypeUi.DIRECTOR"
      model-name="activeDirector"
      :prevent-actions="globalPreventActions"
      variant="correct"
      :action-prevented-signal="actionPreventedSignal"
      @action-prevented="onActionPrevented"
    />

    <!-- FUTURE: conditionally show receivers? -->
    <ManageParties
      v-model:active-party="store.formState.activeReceiver"
      state-key="manage-receivers"
      :loading="store.initializing"
      :empty-text="$t('label.noReceivers')"
      :table-title="$t('label.currentReceivers')"
      :subject="$t('label.receiver')"
      :columns-to-display="partyColumns"
      data-testid="receivers-section"
      :role-type="RoleTypeUi.RECEIVER"
      model-name="activeReceiver"
      :prevent-actions="globalPreventActions"
      variant="correct"
      :party-form-props="{
        partyNameProps: { allowBusinessName: true, allowPreferredName: false }
      }"
      :action-prevented-signal="actionPreventedSignal"
      @action-prevented="onActionPrevented"
    />

    <!-- FUTURE: conditionally show liquidators? -->
    <ManageParties
      v-model:active-party="store.formState.activeLiquidator"
      state-key="manage-liquidators"
      :loading="store.initializing"
      :empty-text="$t('label.noLiquidators')"
      :table-title="$t('label.currentLiquidators')"
      :subject="$t('label.liquidator')"
      :columns-to-display="partyColumns"
      data-testid="liquidators-section"
      :role-type="RoleTypeUi.LIQUIDATOR"
      model-name="activeLiquidator"
      :prevent-actions="globalPreventActions"
      variant="correct"
      :party-form-props="{
        partyNameProps: { allowBusinessName: true, allowPreferredName: false }
      }"
      :action-prevented-signal="actionPreventedSignal"
      @action-prevented="onActionPrevented"
    />

    <ManageShareStructure
      v-model:active-class="store.formState.activeClass"
      v-model:active-series="store.formState.activeSeries"
      data-testid="share-structure-section"
      :loading="store.initializing"
      :empty-text="$t('label.noSubjectAddedYet', { subject: $t('label.shareClasses') })"
      :prevent-actions="globalPreventActions"
      variant="correct"
      :action-prevented-signal="actionPreventedSignal"
      @action-prevented="onActionPrevented"
    />
  </UForm>
</template>
