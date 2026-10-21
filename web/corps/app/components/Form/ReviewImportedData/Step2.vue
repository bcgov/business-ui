<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const store = useReviewImportedDataStore()
const businessStore = useBusinessStore()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

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
    ref="review-imported-data-step-2"
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onError"
  >
    <!-- only the sections the user changed are reviewed - they are the only ones sent -->
    <section class="space-y-6" data-testid="review-section">
      <div>
        <h2 class="text-base">
          1. {{ $t('label.reviewAndConfirm') }}
        </h2>
        <p>{{ $t('text.reviewImportedDataReview') }}</p>
      </div>

      <ManageOffices
        v-if="store.hasOfficeChanges"
        variant="readonly"
        data-testid="review-office-addresses-section"
        :loading="store.initializing"
        :empty-text="$t('label.noOffices')"
        :table-title="$t('label.offices')"
      />

      <ManageParties
        v-if="store.hasDirectorChanges"
        variant="readonly"
        data-testid="review-current-directors-section"
        :loading="store.initializing"
        :empty-text="$t('label.noDirectors')"
        :table-title="$t('label.directors')"
        :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates']"
      />
    </section>

    <FormFolio
      v-if="!store.isStaff && store.formState.folio"
      v-model="store.formState.folio"
      data-testid="folio-section"
      order="2"
      name="folio"
    />

    <FormCertify
      v-if="!store.isStaff && store.formState.certify"
      v-model="store.formState.certify"
      data-testid="certify-section"
      :entity-type="getLegalTypeDescription(businessStore.business?.legalType)"
      order="3"
      name="certify"
    />

    <StaffPaymentFieldset
      v-if="store.isStaff && store.formState.staffPayment"
      ref="staff-pay-ref"
      v-model="store.formState.staffPayment"
      order="2"
      :initializing="store.initializing"
    />
  </UForm>
</template>
