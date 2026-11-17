<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const store = useCourtOrderStore()
const staffPayFormRef = useTemplateRef<StaffPaymentFieldsetRef>('staff-pay-ref')

// only documents that will be submitted with the filing are reviewed
const activeDocs = computed(() => (store.formState.courtOrder.files ?? []).filter(file =>
  file.action !== CourtOrderFileAction.DELETED
  && [CourtOrderFileStatus.SUCCESS, CourtOrderFileStatus.IDLE].includes(file.status)
))
const courtOrderDocs = computed(() => activeDocs.value.filter(file => file.type === DocumentTypeClient.COURT_ORDER))
const supportingDocs = computed(() =>
  activeDocs.value.filter(file => file.type === DocumentTypeClient.SUPPORTING_DOCUMENT)
)

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
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onError"
  >
    <FormReviewWrapper>
      <section class="space-y-6" data-testid="review-section">
        <div>
          <h2 class="text-base">
            {{ $t('label.reviewAndConfirm') }}
          </h2>
          <p>{{ $t('page.courtOrder.descReview') }}</p>
        </div>

        <ConnectPageSection
          data-testid="review-court-order-section"
          :heading="{ label: $t('label.courtOrderAndPoa'), icon: 'i-mdi-gavel' }"
        >
          <dl class="divide-y divide-line-muted padding-x-default py-8">
            <div class="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <dt class="font-bold text-neutral-highlighted sm:w-48 sm:shrink-0">
                {{ $t('label.courtOrder') }}
              </dt>
              <dd data-testid="review-court-order-number" class="break-words">
                {{ store.formState.courtOrder.fileNumber }}
              </dd>
            </div>
            <div class="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <dt class="font-bold text-neutral-highlighted sm:w-48 sm:shrink-0">
                {{ $t('label.planOfArrangement') }}
              </dt>
              <dd data-testid="review-court-order-poa">
                {{ $t(store.formState.courtOrder.effectOfOrder ? 'label.yes' : 'label.no') }}
              </dd>
            </div>
            <div class="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <dt class="font-bold text-neutral-highlighted sm:w-48 sm:shrink-0">
                {{ $t('label.courtOrderDetails') }}
              </dt>
              <dd data-testid="review-court-order-details" class="whitespace-pre-line break-words">
                {{ store.formState.courtOrder.orderDetails?.trim() || $t('label.none') }}
              </dd>
            </div>
            <div class="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <dt class="font-bold text-neutral-highlighted sm:w-48 sm:shrink-0">
                {{ $t('label.courtOrderDocument') }}
              </dt>
              <dd data-testid="review-court-order-document" class="min-w-0 grow">
                <FormCourtOrderPoaFullFileUploadList
                  v-if="courtOrderDocs.length"
                  :aria-label="$t('label.uploadedCourtOrders')"
                >
                  <FormCourtOrderPoaFullFileUploadItem
                    v-for="doc in courtOrderDocs"
                    :key="doc.id"
                    v-bind="doc"
                    readonly
                  />
                </FormCourtOrderPoaFullFileUploadList>
                <template v-else>
                  {{ $t('label.none') }}
                </template>
              </dd>
            </div>
            <div class="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <dt class="font-bold text-neutral-highlighted sm:w-48 sm:shrink-0">
                {{ $t('label.supportingDocuments') }}
              </dt>
              <dd data-testid="review-supporting-documents" class="min-w-0 grow">
                <FormCourtOrderPoaFullFileUploadList
                  v-if="supportingDocs.length"
                  :aria-label="$t('label.uploadedSupportingDocs')"
                >
                  <FormCourtOrderPoaFullFileUploadItem
                    v-for="doc in supportingDocs"
                    :key="doc.id"
                    v-bind="doc"
                    readonly
                  />
                </FormCourtOrderPoaFullFileUploadList>
                <template v-else>
                  {{ $t('label.none') }}
                </template>
              </dd>
            </div>
          </dl>
        </ConnectPageSection>
      </section>

      <template #submission-fields>
        <StaffPaymentFieldset
          ref="staff-pay-ref"
          v-model="store.formState.staffPayment"
          :initializing="store.initializing"
        />
      </template>
    </FormReviewWrapper>
  </UForm>
</template>
