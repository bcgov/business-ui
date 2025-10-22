<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})

useHead({
  title: 'Business Ledger Example'
})

const localePath = useLocalePath()

setBreadcrumbs([
  {
    to: localePath('/'),
    label: 'Examples'
  },
  {
    label: 'BusinessLedger'
  }
])

const { loadBusiness } = useBusinessStore()
const { loadBootstrap, getBootstrapLedgerItems } = useBusinessBootstrapStore()
const { getBusinessLedger } = useBusinessApi()
const { business, businessIdentifier } = storeToRefs(useBusinessStore())
const { bootstrapFiling, bootstrapIdentifier } = storeToRefs(useBusinessBootstrapStore())

const hideReceipts = ref(false)

const isLocked = ref(false)
provide<Ref<boolean>>('isLocked', isLocked)
provide<string>(
  'lockedDocumentsText',
  'Configurable tooltip text over locked documents.')

/** good dev examples:
 * BC0887698 (continuationOut, consentContinuationOut, Alteration from bc to ben)
 * C9900770 (continuationIn, agmExtension, courtOrder, registrars notation+order, dissolution[admin], putBackOn)
 * TUVSVVR7Ko (bootstrap ben incorporation)
 * BC0870917 (restoration[limited], correction)
 * CP3490209 (courtOrder[plan of arrangement])
 * BC0883823 (dissolution[voluntary])
 * BC0873420 (amalgamationApplication, consentContinuationOut, alterations)
 * BC0887748 (consentAmalgamationOut, amalgamationOut)
*/
const identifier = ref('')
const filings = ref<BusinessLedgerItem[]>([])

const includeCourtOrder = ref(true)
const noFilings = ref(false)

const ledgerItems = computed(() => {
  return noFilings.value
    ? []
    : includeCourtOrder.value
      ? filings.value
      : filings.value.filter(filing => filing.name != FilingType.COURT_ORDER)
})

const loading = ref(false)
const loadLedger = async () => {
  loading.value = true
  filings.value = []
  business.value = undefined
  bootstrapFiling.value = undefined
  if (isTempRegIdentifier(identifier.value)) {
    await loadBootstrap(identifier.value)
    filings.value = getBootstrapLedgerItems()
  } else {
    await loadBusiness(identifier.value, true)
    filings.value = await getBusinessLedger(identifier.value) || []
  }
  loading.value = false
}
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      BusinessLedger
    </h1>

    <ConnectPageSection
      :heading="{
        label: 'Example (fully integrated with the backend APIs)'
      }"
      ui-body="p-4 space-y-4"
    >
      <div class="space-y-3">
        <USwitch
          v-model="hideReceipts"
          :disabled="!!businessIdentifier || !!bootstrapIdentifier"
          label="Hide Receipts"
        />
        <ConnectInput
          id="identifier-input"
          v-model="identifier"
          label="Business Identifier"
        />
        <UButton
          :disabled="!identifier"
          label="Load Business Ledger"
          :loading
          @click.stop="loadLedger()"
        />
      </div>
      <ConnectTransitionCollapse>
        <div v-if="!loading && (businessIdentifier || bootstrapIdentifier)">
          <div class="space-x-3">
            <UButton label="Toggle locked" @click="isLocked = !isLocked" />
          </div>
          <div class="bg-shade p-5 mt-3">
            <BusinessLedger
              :business-identifier="identifier"
              :filings="ledgerItems"
              :hide-receipts="hideReceipts"
              :incomplete-business="!businessIdentifier"
            />
          </div>
        </div>
      </ConnectTransitionCollapse>
    </ConnectPageSection>
  </div>
</template>
