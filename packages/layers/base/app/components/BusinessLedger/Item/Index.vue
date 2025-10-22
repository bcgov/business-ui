<script setup lang="ts">
import { FilingStatus, FilingType } from '#imports'

const props = defineProps<{
  filing: BusinessLedgerItem
  setExpanded: boolean
  hideReceipts?: boolean
}>()

provide<BusinessLedgerItem>('filing', props.filing)

const {
  isFilingStatus,
  isFilingType,
  isCourtOrder,
  isFutureEffective,
  isStaffFiling,
  loadComments,
  loadDocuments
} = useBusinessLedger(props.filing)

const { getFilingName } = useFiling()

const showBody = ref(false)
const loadingDetails = ref(false)

const toggleDetails = async () => {
  loadingDetails.value = true
  showBody.value = !showBody.value
  await Promise.all([
    loadComments(),
    loadDocuments(props.hideReceipts)
  ])
  loadingDetails.value = false
}

const year = computed(() => {
  const year = (
    props.filing.data?.annualReport?.annualReportFilingYear
    || (new Date(props.filing.effectiveDate)).getFullYear()
  )
  return `(${year})`
})

const actionBtnLabel = computed(() => (
  props.filing.availableOnPaperOnly
    ? showBody.value
      ? $t('label.close')
      : $t('label.requestACopy')
    : showBody.value
      ? $t('label.hideDocuments')
      : $t('label.viewDocuments')
))

onMounted(() => {
  if (props.setExpanded) {
    toggleDetails()
  }
})
</script>

<template>
  <div class="w-full bg-shade-inverted px-6 py-3 rounded-sm" data-testid="filing-history-item">
    <div class="flex flex-col sm:flex-row" data-testid="filing-history-item-header">
      <div class="flex flex-col">
        <strong>
          <UIcon
            v-if="isCourtOrder"
            class="mr-1"
            name="i-mdi-gavel"
          />
          {{ filing.displayName || getFilingName(filing.name, filing.filingSubType, year, filing.status) }}
        </strong>
        <div class="text-sm">
          <BusinessLedgerItemSubtitleStaff v-if="isStaffFiling" />
          <BusinessLedgerItemSubtitleFutureEffective
            v-else-if="isFutureEffective && !isFilingType(FilingType.CHANGE_OF_ADDRESS)"
          />
          <BusinessLedgerItemSubtitlePending v-else-if="isFilingStatus(FilingStatus.PAID)" />
          <BusinessLedgerItemSubtitleWithdrawn v-else-if="isFilingStatus(FilingStatus.WITHDRAWN)" />
          <BusinessLedgerItemSubtitleRejected v-else-if="isFilingStatus(FilingStatus.REJECTED)" />
          <BusinessLedgerItemSubtitle v-else />
        </div>
        <div>
          <UButton
            v-if="filing.commentsCount > 0"
            class="px-0 shrink"
            :label="`${$t('label.details')} (${filing.commentsCount})`"
            leading-icon="i-mdi-message-text-outline"
            :loading="loadingDetails"
            variant="link"
            @click.stop="toggleDetails"
          />
        </div>
      </div>
      <!-- FUTURE: add the drop-down items for staff here using dropdownItems prop -->
      <ButtonDropdown
        class="sm:ml-auto"
        :button-attrs="{
          label: actionBtnLabel,
          loading: loadingDetails,
          ui: { label: 'font-bold' },
          onClick: toggleDetails
        }"
      />
    </div>
    <ConnectTransitionCollapse>
      <BusinessLedgerItemBody
        v-if="showBody"
        :loading="loadingDetails"
        data-testid="filing-history-item-body"
      />
    </ConnectTransitionCollapse>
  </div>
</template>
