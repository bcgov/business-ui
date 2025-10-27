<script setup lang="ts">
const { t } = useI18n()
const { businessName } = useBusinessStore()
const { bootstrapName } = useBusinessBootstrapStore()

const filing = inject<BusinessLedgerItem>('filing')!

const getFilingLabel = () => {
  switch (filing.name) {
    case FilingType.AMALGAMATION_APPLICATION:
      return t('label.amalgamation')
    case FilingType.CONTINUATION_IN:
    case FilingType.INCORPORATION_APPLICATION:
      return t('label.incorporation')
    case FilingType.REGISTRATION:
      return t('label.registration')
    default:
      return t('label.filing')
  }
}
const filingLabel = getFilingLabel()

const entityName = businessName || bootstrapName || t('text.ThisCompany')

const getBootstrapText = () => {
  switch (filing.name) {
    case FilingType.AMALGAMATION_APPLICATION:
      return t('text.successfullyAmalgamated', { name: entityName })
    case FilingType.CONTINUATION_IN:
      return t('text.successfullyContinuedIn', { name: entityName })
    case FilingType.INCORPORATION_APPLICATION:
      return t('text.successfullyIncorporated', { name: entityName })
    case FilingType.REGISTRATION:
      return t('text.successfullyRegistered', { name: entityName })
    default:
      return undefined
  }
}

const bootstrapText = getBootstrapText()

const goToCompletedBusiness = () => {
  const businessIdentifier = filing.businessIdentifier
  const url = new URL(window.location.href)
  url.pathname = `/${businessIdentifier}`
  window.location.assign(url.toString())
}
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ $t('label.bootstrapComplete', { name: filingLabel }) }}</strong>
    </p>
    <p v-if="bootstrapText">
      {{ bootstrapText }}
    </p>
    <div>
      <p>
        {{ $t('text.systemCompletedProcessingFiling') }}
      </p>
    </div>
    <UButton :label="$t('label.retrieveBusinessInformation')" @click.stop="goToCompletedBusiness()" />
  </div>
</template>
