<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const store = useTransitionStore()
const businessStore = useBusinessStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
const staffPayFormRef = useTemplateRef<StaffPaymentFormRef>('staff-pay-ref')

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
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :add-label="$t('label.addOffice')"
        :edit-label="$t('label.editOffice')"
        :allowed-actions="[]"
      />

      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :add-label="$t('label.addDirector')"
        :edit-label="$t('label.editDirector')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates']"
      />

      <ManageShareStructure
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
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

    <ConnectFieldset
      v-if="store.isStaff && store.formState.staffPayment"
      data-testid="staff-payment-section"
      :label="`4. ${$t('label.staffPayment')}`"
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
