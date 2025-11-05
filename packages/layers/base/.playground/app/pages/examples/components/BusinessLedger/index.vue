<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [
    { to: '/', label: 'Examples' },
    { label: 'BusinessLedger' }
  ]
})

useHead({
  title: 'Business Ledger Example'
})

const localePath = useLocalePath()

const { init: initBusiness, $reset: resetBusiness } = useBusinessStore()
const { init: initBootstrap, getBootstrapLedgerItems, $reset: resetBootstrap } = useBusinessBootstrapStore()
const { getBusinessLedger } = useBusinessApi()
const { business, businessIdentifier } = storeToRefs(useBusinessStore())
const { bootstrapFiling, bootstrapIdentifier } = storeToRefs(useBusinessBootstrapStore())

const hideReceipts = ref(false)

const isLocked = ref(false)
const showDocumentRecords = ref(true)

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

const loading = ref(false)
const loadLedger = async () => {
  loading.value = true
  filings.value = []
  business.value = undefined
  bootstrapFiling.value = undefined
  if (isTempRegIdentifier(identifier.value)) {
    await initBootstrap(identifier.value)
    filings.value = getBootstrapLedgerItems()
  } else {
    await initBusiness(identifier.value, true)
    const ledgerQuery = await getBusinessLedger(identifier.value)
    await ledgerQuery?.refresh()
    filings.value = ledgerQuery?.data.value?.filings || []
  }
  loading.value = false
}

onMounted(() => {
  resetBusiness()
  resetBootstrap()
})
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      BusinessLedger
    </h1>
    <NuxtLink class="text-primary" :to="localePath('/examples/components/BusinessLedger/Mocked')">
      Go to Mocked version of component
    </NuxtLink>
    <ConnectPageSection
      :heading="{
        label: 'Example (login and API integration setup required)'
      }"
      ui-body="p-4 space-y-4"
    >
      <div class="space-y-3">
        <USwitch
          v-model="hideReceipts"
          :disabled="!!businessIdentifier || !!bootstrapIdentifier"
          label="Hide Receipts"
        />
        <USwitch
          v-model="isLocked"
          :disabled="!!businessIdentifier || !!bootstrapIdentifier"
          label="Documents Locked"
        />
        <USwitch
          v-model="showDocumentRecords"
          :disabled="!!businessIdentifier || !!bootstrapIdentifier"
          label="Show Manage Document Records (FF must also be on for these to show)"
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
          <div class="bg-shade p-5 mt-3">
            <BusinessLedger
              :business-identifier="identifier"
              :filings
              :hide-receipts="hideReceipts"
              :incomplete-business="!businessIdentifier"
              :locked-documents="isLocked"
              locked-documents-tooltip="Configurable tooltip text over locked documents."
              :show-document-records="showDocumentRecords"
            />
          </div>
        </div>
      </ConnectTransitionCollapse>
    </ConnectPageSection>
  </div>
</template>
