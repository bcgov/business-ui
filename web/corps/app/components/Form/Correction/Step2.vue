<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'
import { CORRECTION_DETAIL_COMMENT_MAX_LENGTH } from '~/utils/schemas/correction'
import { CORPS } from '~/utils'

const store = useCorrectionStore()
const businessStore = useBusinessStore()
const { business, businessContact } = storeToRefs(businessStore)
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')
const partyColumns: TablePartyColumnName[] = ['name', 'mailing', 'delivery', 'effectiveDates']

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
    || store.resolutionDates.some(rd => rd.new.actions.length > 0)
})

/** Whether any receivers were changed */
const hasReceiverChanges = computed(() => {
  return store.receivers.some(r => r.new.actions.length > 0)
})

/** Whether any liquidators were changed */
const hasLiquidatorChanges = computed(() => {
  return store.liquidators.some(l => l.new.actions.length > 0)
})

const requiresAuthorization = computed(() => {
  const legalType = businessStore.business?.legalType as CorpTypeCd | undefined
  return legalType ? CORPS.includes(legalType) : false
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

      <!-- Company Name (readonly, always displayed) -->
      <ManageCompanyName
        :loading="store.initializing"
        :business
        :contact="businessContact"
        variant="correct-readonly"
      />

      <!-- Office Addresses (readonly, only if changed) -->
      <!-- Section 2: Office Addresses -->
      <ManageOffices
        v-if="hasOfficeChanges"
        data-testid="review-office-addresses-section"
        :loading="store.initializing"
        :empty-text="$t('label.noOffices')"
        :table-title="$t('label.offices')"
        variant="correct-readonly"
      />

      <!-- Directors (readonly, only if changed) -->
      <ManageParties
        v-if="hasDirectorChanges"
        :loading="store.initializing"
        :empty-text="$t('label.noDirectors')"
        :table-title="$t('label.currentDirectors')"
        :columns-to-display="partyColumns"
        data-testid="review-current-directors-section"
        variant="correct-readonly"
      />

      <!-- Receivers (readonly, only if changed) -->
      <ManageParties
        v-if="hasReceiverChanges"
        :loading="store.initializing"
        :empty-text="$t('label.noReceivers')"
        :table-title="$t('label.currentReceivers')"
        :columns-to-display="partyColumns"
        data-testid="review-receivers-section"
        variant="correct-readonly"
        state-key="manage-receivers"
      />

      <!-- Liquidators (readonly, only if changed) -->
      <ManageParties
        v-if="hasLiquidatorChanges"
        state-key="manage-liquidators"
        :loading="store.initializing"
        :empty-text="$t('label.noLiquidators')"
        :table-title="$t('label.currentLiquidators')"
        :columns-to-display="partyColumns"
        data-testid="review-liquidators-section"
        variant="correct-readonly"
      />

      <!-- Share Structure (readonly, only if changed) -->
      <ManageShareStructure
        v-if="hasShareStructureChanges"
        data-testid="review-share-structure-section"
        :loading="store.initializing"
        :empty-text="$t('label.noShareClasses')"
        variant="correct-readonly"
        :collect-resolution-date="store.requireResolutionDate"
      />
    </section>

    <!-- Section 2: Correction Detail Comment -->
    <FormDetail
      v-model="store.correctionComment"
      name="comment"
      order="2"
      :filing-date="store.correctedFilingDateDisplay"
      :description="$t('text.correctionCommentDescription')"
      :max-length="CORRECTION_DETAIL_COMMENT_MAX_LENGTH"
      data-testid="correction-comment-section"
    />

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
      :entity-type="getLegalTypeDescription(businessStore.business?.legalType)"
      order="5"
      name="certify"
    />

    <FormConfirmAuthorization
      v-if="requiresAuthorization && store.formState.authorization"
      v-model="store.formState.authorization"
      :entity-type="getLegalTypeDescription(businessStore.business?.legalType)"
      :order="store.isStaffCorrectionType ? 4 : 6"
      name="authorization"
    />

    <!-- Staff Payment (always present, order is dynamic) -->
    <StaffPaymentFieldset
      v-if="store.formState.staffPayment"
      ref="staff-pay-ref"
      v-model="store.formState.staffPayment"
      :order="store.isStaffCorrectionType ? 5 : 7"
      :initializing="store.initializing"
    />
  </UForm>
</template>
