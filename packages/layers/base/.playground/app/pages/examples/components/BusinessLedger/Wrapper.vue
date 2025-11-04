<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})

useHead({
  title: 'Business Ledger Wrapper Example'
})

const localePath = useLocalePath()

setBreadcrumbs([
  {
    to: localePath('/'),
    label: 'Examples'
  },
  {
    label: 'BusinessLedgerWrapper'
  }
])

const { init: initBusiness, $reset: resetBusiness } = useBusinessStore()
const { init: initBootstrap, $reset: resetBootstrap } = useBusinessBootstrapStore()
const { business, businessIdentifier } = storeToRefs(useBusinessStore())
const { bootstrapFiling, bootstrapIdentifier } = storeToRefs(useBusinessBootstrapStore())

const hideReceipts = ref(false)

const isLocked = ref(false)

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
const beforeDate = ref('')

const loading = ref(false)
const loadLedger = async () => {
  loading.value = true
  business.value = undefined
  bootstrapFiling.value = undefined
  if (isTempRegIdentifier(identifier.value)) {
    await initBootstrap(identifier.value)
  } else {
    await initBusiness(identifier.value, true)
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
      BusinessLedgerWrapper
    </h1>
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
        <ConnectInput
          id="identifier-input"
          v-model="identifier"
          label="Business Identifier"
        />
        <UFormField help="yyyy-mm-dd">
          <ConnectInput
            id="before-date-input"
            v-model="beforeDate"
            label="Before Date (Optional)"
            hint="yyyy-mm-dd"
          />
        </UFormField>
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
            <BusinessLedgerWrapper
              :business-id="identifier"
              :date="beforeDate ?? undefined"
              :hide-receipts="hideReceipts"
              :locked-documents="isLocked"
              locked-documents-tooltip="Configurable tooltip text over locked documents."
            />
          </div>
        </div>
      </ConnectTransitionCollapse>
    </ConnectPageSection>
  </div>
</template>
