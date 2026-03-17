<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const store = useTransitionStore()
const businessStore = useBusinessStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
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
    ref="ta-form-step-2"
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onError"
  >
    <section class="space-y-6" data-testid="review-section">
      <div>
        <h2 class="text-base">
          1. {{ $t('label.reviewAndConfirm') }}
        </h2>
        <p>{{ $t('text.officeDirectorsSharesMustBeCorrectBeforeFiling') }}</p>
      </div>

      <ManageOffices
        v-model:active-office="activeOffice"
        data-testid="office-addresses-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :add-label="$t('label.addOffice')"
        :section-label="$t('label.offices')"
        :allowed-actions="[]"
      />

      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        data-testid="current-directors-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :add-label="$t('label.addDirector')"
        :section-label="$t('label.directors')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[]"
        :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates']"
      />

      <ManageShareStructure
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
        data-testid="share-structure-section"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noShareClasses')"
        :add-label="$t('label.addShareClass')"
        readonly
      />
    </section>

    <FormPreExistingCompanyProvisions order="2" data-testid="provisions-section" />

    <FormDocumentDelivery
      v-if="store.formState.documentDelivery"
      v-model="store.formState.documentDelivery"
      order="3"
      name="documentDelivery"
      :loading="store.initializing"
      :registered-office-email="businessStore.businessContact?.email"
    />

    <FormFolio
      v-if="!store.isStaff && store.formState.folio"
      v-model="store.formState.folio"
      data-testid="folio-section"
      order="4"
      name="folio"
    />

    <FormCertify
      v-if="!store.isStaff && store.formState.certify"
      v-model="store.formState.certify"
      order="5"
      name="certify"
      :description="$t('text.certifyTransitionDescription')"
    />

    <StaffPaymentFieldset
      v-if="store.isStaff && store.formState.staffPayment"
      ref="staff-pay-ref"
      v-model="store.formState.staffPayment"
      order="4"
      :initializing="store.initializing"
    />
  </UForm>
</template>
