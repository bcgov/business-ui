<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'
import { isEqual } from 'es-toolkit'

const store = useCorrectionStore()
const businessStore = useBusinessStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')

/** Whether any offices were changed (compare current vs initial) */
const hasOfficeChanges = computed(() => {
  return !isEqual(
    store.offices.map(o => o.new),
    store.initialFormState
  ) && store.offices.some(o => o.new.actions?.length > 0)
})

/** Whether any directors were changed (compare current vs initial snapshot) */
const hasDirectorChanges = computed(() => {
  return !isEqual(store.directors, store.initialDirectors)
})

/** Whether any share classes were changed (compare current vs initial snapshot) */
const hasShareStructureChanges = computed(() => {
  return !isEqual(store.shareClasses, store.initialShareClasses)
})

/** Whether any receivers were changed (compare current vs initial snapshot) */
const hasReceiverChanges = computed(() => {
  return !isEqual(store.receivers, store.initialReceivers)
})

/** Whether any liquidators were changed (compare current vs initial snapshot) */
const hasLiquidatorChanges = computed(() => {
  return !isEqual(store.liquidators, store.initialLiquidators)
})

/** Whether the correction comment was changed */
const hasCommentChanges = computed(() => {
  return !!store.formState.comment && store.formState.comment.trim().length > 0
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
        color="red"
        :description="$t('form.manageBusiness.noOptionAlert')"
        title="No changes have been made to the business data. Please go back and make corrections before submitting."
        data-testid="no-changes-alert"
      />

      <!-- Office Addresses (readonly, only if changed) -->
      <ManageOffices
        v-if="hasOfficeChanges"
        v-model:active-office="activeOffice"
        data-testid="review-office-addresses-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :add-label="$t('label.addOffice')"
        :edit-label="$t('label.editOffice')"
        :allowed-actions="[]"
      />

      <!-- Directors (readonly, only if changed) -->
      <ManageParties
        v-if="hasDirectorChanges"
        v-model:active-party="store.formState.activeDirector"
        data-testid="review-current-directors-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :add-label="$t('label.addDirector')"
        :edit-label="$t('label.editDirector')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
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
      />

      <!-- Receivers (readonly, only if changed) -->
      <ManageParties
        v-if="hasReceiverChanges"
        v-model:active-party="store.formState.activeReceiver"
        state-key="manage-receivers"
        data-testid="review-receivers-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noReceivers')"
        :add-label="$t('label.addReceiver')"
        :edit-label="$t('label.editReceiver')"
        :role-type="RoleTypeUi.RECEIVER"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
      />

      <!-- Liquidators (readonly, only if changed) -->
      <ManageParties
        v-if="hasLiquidatorChanges"
        v-model:active-party="store.formState.activeLiquidator"
        state-key="manage-liquidators"
        data-testid="review-liquidators-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noLiquidators')"
        :add-label="$t('label.addLiquidator')"
        :edit-label="$t('label.editLiquidator')"
        :role-type="RoleTypeUi.LIQUIDATOR"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
      />

      <!-- Correction Comment (always shown if present) -->
      <div
        v-if="hasCommentChanges"
        class="rounded bg-white p-6 space-y-2"
        data-testid="review-comment-section"
      >
        <h3 class="font-semibold">
          {{ $t('label.correctionComment') }}
        </h3>
        <p class="whitespace-pre-wrap">
          {{ store.formState.comment }}
        </p>
      </div>
    </section>

    <!-- Section 2: Document Delivery -->
    <FormDocumentDelivery
      v-if="store.formState.documentDelivery"
      v-model="store.formState.documentDelivery"
      order="2"
      name="documentDelivery"
      :loading="store.initializing"
      :registered-office-email="businessStore.businessContact?.email"
    />

    <!-- Section 3 (client): Folio -->
    <FormFolio
      v-if="!store.isStaff && store.formState.folio"
      v-model="store.formState.folio"
      data-testid="folio-section"
      order="3"
      name="folio"
    />

    <!-- Section 4 (client): Certify -->
    <FormCertify
      v-if="!store.isStaff && store.formState.certify"
      v-model="store.formState.certify"
      order="4"
      name="certify"
      :description="$t('text.certifyCorrectionDescription')"
    />

    <!-- Section 3 (staff): Staff Payment -->
    <ConnectFieldset
      v-if="store.isStaff && store.formState.staffPayment"
      data-testid="staff-payment-section"
      :label="`3. ${$t('label.staffPayment')}`"
      body-variant="card"
    >
      <ConnectFormFieldWrapper :label="$t('label.payment')" orientation="horizontal">
        <StaffPayment
          ref="staff-pay-ref"
          v-model="store.formState.staffPayment"
          :disabled="store.initializing"
          :show-priority="true"
          name="staffPayment"
          :enable-auto-reset="!store.initializing"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
