<script setup lang="ts">
const store = useCorrectionStore()
const { business, businessContact } = storeToRefs(useBusinessStore())

/** Display-level label overrides for correction context */
const correctionLabelOverrides = getCorrectionLabelOverrides()

const partyColumns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'effectiveDates', 'actions']
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
      variant="correct"
    />

    <ManageOffices
      v-model:active-office="store.formState.activeOffice"
      data-testid="office-addresses-section"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
      :table-title="$t('label.officeAddresses')"
      subject=""
      variant="correct"
      :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      :label-overrides="correctionLabelOverrides"
    />

    <ManageParties
      v-model:active-party="store.formState.activeDirector"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
      :table-title="$t('label.currentDirectors')"
      :subject="$t('label.director')"
      :columns-to-display="partyColumns"
      data-testid="current-directors-section"
      :role-type="RoleTypeUi.DIRECTOR"
      model-name="activeDirector"
      variant="correct"
    />

    <!-- FUTURE: conditionally show receivers? -->
    <ManageParties
      v-model:active-party="store.formState.activeReceiver"
      state-key="manage-receivers"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noReceivers')"
      :table-title="$t('label.currentReceivers')"
      :subject="$t('label.receiver')"
      :columns-to-display="partyColumns"
      data-testid="receivers-section"
      :role-type="RoleTypeUi.RECEIVER"
      model-name="activeReceiver"
      variant="correct"
      :party-form-props="{
        partyNameProps: { allowBusinessName: true, allowPreferredName: false }
      }"
    />

    <!-- FUTURE: conditionally show liquidators? -->
    <ManageParties
      v-model:active-party="store.formState.activeLiquidator"
      state-key="manage-liquidators"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noLiquidators')"
      :table-title="$t('label.currentLiquidators')"
      :subject="$t('label.liquidator')"
      :columns-to-display="partyColumns"
      data-testid="liquidators-section"
      :role-type="RoleTypeUi.LIQUIDATOR"
      model-name="activeLiquidator"
      variant="correct"
      :party-form-props="{
        partyNameProps: { allowBusinessName: true, allowPreferredName: false }
      }"
    />

    <ManageShareStructure
      v-model:active-class="store.formState.activeClass"
      v-model:active-series="store.formState.activeSeries"
      data-testid="share-structure-section"
      :loading="store.initializing"
      :empty-text="store.initializing
        ? `${$t('label.loading')}...`
        : $t('label.noSubjectAddedYet', { subject: $t('label.shareClasses') })
      "
      variant="correct"
      :label-overrides="correctionLabelOverrides"
    />
  </UForm>
</template>
