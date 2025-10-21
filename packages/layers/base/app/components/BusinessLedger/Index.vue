<script setup lang="ts">
const props = defineProps<{
  businessIdentifier: string
  filings: BusinessLedgerItem[]
  incompleteBusiness?: boolean
  hideReceipts?: boolean
}>()

const hasCourtOrders = computed(() => (
  props.filings.findIndex(filing => filing.name === FilingType.COURT_ORDER)) !== -1)

const urlFilingId = useRequestURL().searchParams.get('filing_id')

const downloading = ref(false)

const permissionsStore = useBusinessPermissionsStore()
const drsStore = useDocumentRecordServiceStore()
onMounted(async () => {
  await Promise.all([
    permissionsStore.init(),
    drsStore.init({ consumerIdentifier: props.businessIdentifier })
  ])
})
</script>

<template>
  <div
    class="flex flex-col gap-1.5"
    data-testid="filing-history-list"
  >
    <!-- Court order notification -->
    <div
      v-if="hasCourtOrders"
      class="flex gap-2 w-full bg-shade-inverted p-5 rounded mb-5 items-center"
      data-testid="court-order-notification"
    >
      <UIcon name="i-mdi-gavel" class="text-xl text-black" />
      <span class="ml-1 text-base">{{ $t('text.courtOrdersHaveBeenFiled') }}</span>
    </div>

    <BusinessLedgerItem
      v-for="filing in filings"
      :key="filing.filingId"
      :downloading
      :filing
      :hide-receipts
      :set-expanded="urlFilingId === filing.filingId.toString()"
    />

    <div
      v-if="!filings.length"
      class="flex flex-col w-full bg-shade-inverted p-5 rounded"
      data-testid="filing-history-empty"
    >
      <div v-if="incompleteBusiness" class="flex justify-center">
        <p>{{ $t('text.completeYourFilingToDisplay') }}</p>
      </div>
      <div v-else>
        <p><strong>{{ $t('text.youHaveNoBusinessLedger') }}</strong></p>
        <p>{{ $t('text.yourFilingsWillAppearHere') }}</p>
      </div>
    </div>
  </div>
</template>
