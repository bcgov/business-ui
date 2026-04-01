<script setup lang="ts">
const store = useCorrectionStore()

const directorAllowedActions = [
  ManageAllowedAction.ADD,
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.REMOVE
]

const receiverLiquidatorAllowedActions = [
  ManageAllowedAction.ADD,
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.REMOVE
]

/** Display-level label overrides for correction context */
const correctionLabelOverrides = useCorrectionLabelOverrides()
</script>

<template>
  <UForm
    ref="correction-form-step-1"
    :state="store.formState"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onFormSubmitError"
  >
    <!-- Section 1: Name Translations -->
    <section class="space-y-4" data-testid="name-translations-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.nameTranslations') }}
        </h2>
        <p>{{ $t('text.nameTranslationsDescription') }}</p>
      </div>

      <ManageNameTranslations
        v-model:active-name-translation="store.formState.activeNameTranslation"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noNameTranslations')"
        :add-label="$t('label.addNameTranslation')"
        :allowed-actions="[ManageAllowedAction.ADD, ManageAllowedAction.NAME_CHANGE, ManageAllowedAction.REMOVE]"
        :label-overrides="correctionLabelOverrides"
      />
    </section>

    <!-- Section 2: Office Addresses -->
    <section class="space-y-4" data-testid="office-addresses-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.officeAddresses') }}
        </h2>
        <p>{{ $t('text.officeAddressesMustBeCorrect') }}</p>
      </div>

      <ManageOffices
        v-model:active-office="store.formState.activeOffice"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :section-label="$t('label.officeAddresses')"
        :add-label="$t('label.addOffice')"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        :label-overrides="correctionLabelOverrides"
      />
    </section>

    <!-- Section 3: Directors -->
    <section class="space-y-4" data-testid="current-directors-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.currentDirectors') }}
        </h2>
        <p>{{ $t('text.currentDirectorsMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :section-label="$t('label.currentDirectors')"
        :add-label="$t('label.addDirector')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="directorAllowedActions"
        :label-overrides="correctionLabelOverrides"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeDirector"
      />
    </section>

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
    <section class="space-y-4" data-testid="receivers-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.receivers') }}
        </h2>
        <p>{{ $t('text.receiversMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeReceiver"
        state-key="manage-receivers"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noReceivers')"
        :section-label="$t('label.receivers')"
        :add-label="$t('label.addReceiver')"
        :role-type="RoleTypeUi.RECEIVER"
        :allowed-actions="receiverLiquidatorAllowedActions"
        :label-overrides="correctionLabelOverrides"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeReceiver"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: false }
        }"
      />
    </section>

    <!-- Section 6: Liquidators -->
    <!-- ToDO: Do we want liquidators conditionally -->
    <section class="space-y-4" data-testid="liquidators-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.liquidators') }}
        </h2>
        <p>{{ $t('text.liquidatorsMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeLiquidator"
        state-key="manage-liquidators"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noLiquidators')"
        :section-label="$t('label.liquidators')"
        :add-label="$t('label.addLiquidator')"
        :role-type="RoleTypeUi.LIQUIDATOR"
        :allowed-actions="receiverLiquidatorAllowedActions"
        :label-overrides="correctionLabelOverrides"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeLiquidator"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: false }
        }"
      />
    </section>
  </UForm>
</template>
