<script setup lang="ts">
const store = useCorrectionStore()
const { business, businessContact } = storeToRefs(useBusinessStore())

/** Display-level label overrides for correction context */
const correctionLabelOverrides = getCorrectionLabelOverrides()
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
    />

    <!-- Section 2: Office Addresses -->
    <ManageOffices
      v-model:active-office="store.formState.activeOffice"
      data-testid="office-addresses-section"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
      :section-title="`1. ${$t('label.officeAddresses')}`"
      :section-description="$t('text.officeAddressesMustBeCorrect')"
      :table-title="$t('label.offices')"
      subject=""
      variant="correct"
      :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      :label-overrides="correctionLabelOverrides"
    />

    <!-- Section 3: Directors -->
    <ManageParties
      v-model:active-party="store.formState.activeDirector"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
      :table-title="$t('label.currentDirectors')"
      :subject="$t('label.director')"
      :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
      data-testid="current-directors-section"
      :role-type="RoleTypeUi.DIRECTOR"
      :label-overrides="correctionLabelOverrides"
      model-name="activeDirector"
      variant="correct"
    />

    <!-- Section 4: Share Structure -->
    <section data-testid="share-structure-section">
      <h2 class="text-base">
        {{ $t('label.shareStructure') }}
      </h2>

      <ManageShareStructure
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
        :loading="store.initializing"
        :empty-text="store.initializing
          ? `${$t('label.loading')}...`
          : $t('label.noShareClasses')
        "
        :add-label="$t('label.addShareClass')"
        :label-overrides="correctionLabelOverrides"
      />
    </section>

    <!-- Section 5: Receivers -->
    <!-- ToDO: Do we want receivers conditionally -->
    <ManageParties
      v-model:active-party="store.formState.activeReceiver"
      state-key="manage-receivers"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noReceivers')"
      :table-title="$t('label.currentReceivers')"
      :subject="$t('label.receiver')"
      :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
      data-testid="receivers-section"
      :role-type="RoleTypeUi.RECEIVER"
      :label-overrides="correctionLabelOverrides"
      model-name="activeReceiver"
      variant="correct"
      :party-form-props="{
        partyNameProps: { allowBusinessName: true, allowPreferredName: false }
      }"
    />

    <!-- Section 6: Liquidators -->
    <!-- ToDO: Do we want liquidators conditionally -->
    <ManageParties
      v-model:active-party="store.formState.activeLiquidator"
      state-key="manage-liquidators"
      :loading="store.initializing"
      :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noLiquidators')"
      :table-title="$t('label.currentLiquidators')"
      :subject="$t('label.liquidator')"
      :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
      data-testid="liquidators-section"
      :role-type="RoleTypeUi.LIQUIDATOR"
      :label-overrides="correctionLabelOverrides"
      model-name="activeLiquidator"
      variant="correct"
      :party-form-props="{
        partyNameProps: { allowBusinessName: true, allowPreferredName: false }
      }"
    />
  </UForm>
</template>
