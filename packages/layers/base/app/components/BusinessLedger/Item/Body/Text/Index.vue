<script setup lang="ts">
import { FilingSubType, FilingType } from '#imports'

const { t } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!
const {
  isChangeOfOfficers,
  isFilingStatus,
  isFilingType,
  isFutureEffective,
  isFutureEffectiveAndPending
} = useBusinessLedger(filing)

const { businessIdentifier } = useBusinessStore()
const { bootstrapIdentifier } = useBusinessBootstrapStore()

const isFilingRejected = isFilingStatus(FilingStatus.REJECTED)
const isFilingPaidOrApproved = isFilingStatus(FilingStatus.PAID || FilingStatus.APPROVED)

const hasExpiry = !!filing.data?.consentAmalgamationOut?.expiry || !!filing.data?.consentContinuationOut?.expiry

const isMovedOutFiling = isFilingType(FilingType.AMALGAMATION_OUT) || isFilingType(FilingType.CONTINUATION_OUT)

const isLimitedRestorationWithBodyText = (
  isFilingType(undefined, FilingSubType.LIMITED_RESTORATION)
  || isFilingType(undefined, FilingSubType.LIMITED_RESTORATION_EXTENSION)
)

// It is a bootstrap filing and business is not loaded (page context is before business exists)
const showBootstrapDisplay = !!bootstrapIdentifier && !businessIdentifier

const hasCompletedText = (
  hasExpiry
  || showBootstrapDisplay
  || isFilingType(FilingType.AGM_EXTENSION)
  || isFilingType(FilingType.ALTERATION)
  || isFilingType(undefined, FilingSubType.DISSOLUTION_VOLUNTARY)
  || isLimitedRestorationWithBodyText
  || isMovedOutFiling
)

const orderDetails = filing.data?.order?.orderDetails?.split('\n')

const courtOrderNumber = computed(() => filing.data?.order?.fileNumber)

const hasEffectOfOrder = computed(() => !!filing.data?.order?.effectOfOrder)

const showBcregContact = computed(() => {
  return (
    filing.availableOnPaperOnly
    || isFutureEffective
    || isFutureEffectiveAndPending
    || isFilingPaidOrApproved
    || isFilingType(undefined, FilingSubType.LIMITED_RESTORATION)
    || isFilingType(undefined, FilingSubType.LIMITED_RESTORATION_EXTENSION)
  )
})

const componentIsNotEmpty = (
  filing.availableOnPaperOnly
  || isFilingRejected
  || isFutureEffective
  || isFutureEffectiveAndPending
  || isFilingPaidOrApproved
  || hasCompletedText
  || (orderDetails && orderDetails.length)
  || courtOrderNumber
  || hasEffectOfOrder
  || showBcregContact
)
</script>

<template>
  <div v-if="componentIsNotEmpty" class="space-y-4">
    <p v-if="filing.availableOnPaperOnly">
      {{ $t('text.filingAvailableOnPaperOnly') }}
    </p>

    <div v-else-if="isFilingRejected">
      <BusinessLedgerItemBodyTextSectionRejected />
    </div>

    <div v-else-if="isFutureEffective || isFutureEffectiveAndPending">
      <BusinessLedgerItemBodyTextSectionFutureEffective />
    </div>

    <div v-else-if="isFilingPaidOrApproved">
      <div v-if="isChangeOfOfficers">
        <p>{{ $t('text.pendingButNotCompletedByRegistry') }}</p>
        <p>{{ $t('text.pendingButNotCompletedByRegistry1') }}</p>
      </div>
      <div v-else>
        <strong>{{ $t('label.filingPending') }}</strong>
        <p>
          {{ $t('text.paidButNotCompletedByRegistry', { name: filing.displayName || t('text.filing') }) }}
        </p>
        <p>{{ $t('text.refreshScreenOrContact') }}</p>
      </div>
    </div>

    <!-- completed -->
    <div v-else-if="hasCompletedText">
      <BusinessLedgerItemBodyTextSectionCompletedConsentExpiry v-if="hasExpiry" />
      <BusinessLedgerItemBodyTextSectionCompletedBootstrap v-else-if="showBootstrapDisplay" />
      <BusinessLedgerItemBodyTextSectionCompletedLimitedRestoration v-else-if="isLimitedRestorationWithBodyText" />
      <BusinessLedgerItemBodyTextSectionCompletedMovedOut v-else-if="isMovedOutFiling" />
      <BusinessLedgerItemBodyTextSectionCompletedAgmExtension v-else-if="isFilingType(FilingType.AGM_EXTENSION)" />
      <BusinessLedgerItemBodyTextSectionCompletedAlteration v-else-if="isFilingType(FilingType.ALTERATION)" />
      <BusinessLedgerItemBodyTextSectionCompletedDissolutionVoluntary
        v-else-if="isFilingType(undefined, FilingSubType.DISSOLUTION_VOLUNTARY)"
      />
    </div>

    <div v-if="orderDetails && orderDetails.length">
      <p v-for="order, i of orderDetails" :key="`order-${i}`">
        {{ order }}
      </p>
    </div>

    <p v-if="courtOrderNumber">
      {{ $t('label.courtOrderNumber') }}: {{ courtOrderNumber }}
    </p>

    <p v-if="hasEffectOfOrder">
      {{ $t('label.pursuantToPlanOfArrangement') }}
    </p>

    <BusinessHelpContact v-if="showBcregContact" />
  </div>
</template>
