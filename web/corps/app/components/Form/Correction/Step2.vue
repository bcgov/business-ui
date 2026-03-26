<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'
import { CORRECTION_DETAIL_COMMENT_MAX_LENGTH } from '../../../utils/schemas/correction'

const store = useCorrectionStore()
const businessStore = useBusinessStore()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

/** Display-level label overrides for correction context */
const correctionLabelOverrides = useCorrectionLabelOverrides()

/**
 * Change detection for review sections.
 *
 * These check the `actions` array on each table entry rather than comparing
 * current vs initial snapshots. This is necessary because when resuming a
 * saved draft, the initial snapshot IS the merged (draft + original) state,
 * so initial === current. The `actions` array (e.g. ["ADDRESS_CHANGED"],
 * ["CORRECTED"]) is the reliable indicator that a correction change exists.
 */

/** Whether any offices were changed */
const hasOfficeChanges = computed(() => {
  return store.offices.some(o => o.new.actions?.length > 0)
})

/** Whether any directors were changed */
const hasDirectorChanges = computed(() => {
  return store.directors.some(d => d.new.actions.length > 0)
})

/** Whether any share classes were changed */
const hasShareStructureChanges = computed(() => {
  return store.shareClasses.some(sc => sc.new.actions.length > 0)
})

/** Whether any receivers were changed */
const hasReceiverChanges = computed(() => {
  return store.receivers.some(r => r.new.actions.length > 0)
})

/** Whether any liquidators were changed */
const hasLiquidatorChanges = computed(() => {
  return store.liquidators.some(l => l.new.actions.length > 0)
})

/** Whether any correctable section has changes — used to show a warning if nothing changed */
const hasAnyChanges = computed(() => {
  return hasOfficeChanges.value
    || hasDirectorChanges.value
    || hasShareStructureChanges.value
    || hasReceiverChanges.value
    || hasLiquidatorChanges.value
})

function onError(event: FormErrorEvent) {
  const firstError = event?.errors?.[0]

  if (firstError?.name === 'staffPayment.option') {
    staffPayFormRef.value?.setFocusOnError()
  } else {
    onFormSubmitError(event)
  }
}
</script>

<template>
  <UForm
    ref="correction-form-step-2"
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onError"
  >
    <!-- Review Section: Only show changed sections -->
    <section class="space-y-6" data-testid="review-section">
      <div>
        <h2 class="text-base">
          1. {{ $t('label.reviewAndConfirm') }}
        </h2>
        <p>{{ $t('text.correctionReviewDescription') }}</p>
      </div>

      <!-- No changes warning -->
      <UAlert
        v-if="!hasAnyChanges"
        icon="i-mdi-information-outline"
        color="warning"
        :description="$t('form.manageBusiness.noOptionAlert')"
        title="No changes have been made to the business data. Please go back and make corrections before submitting."
        data-testid="no-changes-alert"
      />

      <!-- Office Addresses (readonly, only if changed) -->
      <ManageOffices
        v-if="hasOfficeChanges"
        v-model:active-office="store.formState.activeOffice"
        data-testid="review-office-addresses-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :section-label="$t('label.officeAddresses')"
        :add-label="$t('label.addOffice')"
        :allowed-actions="[]"
        readonly
        :label-overrides="correctionLabelOverrides"
      />

      <!-- Directors (readonly, only if changed) -->
      <ManageParties
        v-if="hasDirectorChanges"
        v-model:active-party="store.formState.activeDirector"
        data-testid="review-current-directors-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :section-label="$t('label.currentDirectors')"
        :add-label="$t('label.addDirector')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
        :label-overrides="correctionLabelOverrides"
      />

      <!-- Share Structure (readonly, only if changed) -->
      <ManageShareStructure
        v-if="hasShareStructureChanges"
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
        data-testid="review-share-structure-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noShareClasses')"
        :add-label="$t('label.addShareClass')"
        readonly
        :label-overrides="correctionLabelOverrides"
      />

      <!-- Receivers (readonly, only if changed) -->
      <ManageParties
        v-if="hasReceiverChanges"
        v-model:active-party="store.formState.activeReceiver"
        state-key="manage-receivers"
        data-testid="review-receivers-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noReceivers')"
        :section-label="$t('label.receivers')"
        :add-label="$t('label.addReceiver')"
        :role-type="RoleTypeUi.RECEIVER"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
        :label-overrides="correctionLabelOverrides"
      />

      <!-- Liquidators (readonly, only if changed) -->
      <ManageParties
        v-if="hasLiquidatorChanges"
        v-model:active-party="store.formState.activeLiquidator"
        state-key="manage-liquidators"
        data-testid="review-liquidators-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noLiquidators')"
        :section-label="$t('label.liquidators')"
        :add-label="$t('label.addLiquidator')"
        :role-type="RoleTypeUi.LIQUIDATOR"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
        :label-overrides="correctionLabelOverrides"
      />
    </section>

    <!-- Section 2: Correction Detail Comment -->
    <section class="space-y-4" data-testid="correction-comment-section">
      <FormDetail
        v-model="store.correctionComment"
        name="comment"
        order="2"
        :filing-date="store.correctedFilingDateDisplay"
        :description="$t('text.correctionCommentDescription')"
        :max-length="CORRECTION_DETAIL_COMMENT_MAX_LENGTH"
      />
    </section>

    <!-- Section 3: Document Delivery -->
    <FormDocumentDelivery
      v-if="store.formState.documentDelivery"
      v-model="store.formState.documentDelivery"
      order="3"
      name="documentDelivery"
      :loading="store.initializing"
      :registered-office-email="businessStore.businessContact?.email"
    />

    <!-- Section 4 (client): Completing Party -->
    <FormCompletingParty
      v-if="!store.isStaffCorrectionType && store.formState.completingParty"
      v-model="store.formState.completingParty"
      order="4"
      name="completingParty"
    />

    <!-- Section 5 (client): Certify -->
    <FormCertify
      v-if="!store.isStaffCorrectionType && store.formState.certify"
      v-model="store.formState.certify"
      order="5"
      name="certify"
      :description="$t('text.certifyCorrectionDescription')"
    />

    <!-- Staff Payment (always present, order is dynamic) -->
    <StaffPaymentFieldset
      v-if="store.formState.staffPayment"
      ref="staff-pay-ref"
      v-model="store.formState.staffPayment"
      :order="store.isStaffCorrectionType ? 4 : 6"
      :initializing="store.initializing"
    />
  </UForm>
</template>
