<script setup lang="ts">
import {
  NrRequestActionCodes,
  FilingTypes
} from '@bcrs-shared-components/enums'

const { t } = useNuxtApp().$i18n

// Define eligible corporation types for continuation in
const ELIGIBLE_CORP_TYPES = [
  CorpTypes.CONTINUE_IN,
  CorpTypes.BEN_CONTINUE_IN,
  CorpTypes.CCC_CONTINUE_IN,
  CorpTypes.ULC_CONTINUE_IN
]

definePageMeta({ order: 0 })

const { isLoading, processMagicLink } = useMagicLinkProcessing()

/**
 * Handles the magic link flow for continuation in applications.
 * Processes name request data from URL parameters and creates a new
 * draft filing if one doesn't already exist for this name request.
 */
onMounted(async () => {
  await processMagicLink({
    filingType: FilingTypes.CONTINUATION_IN,
    eligibleCorpTypes: ELIGIBLE_CORP_TYPES,
    requestActionCode: NrRequestActionCodes.MOVE,
    errorModalTitle: t('error.magicLinkFilingError.title'),
    errorModalDescription: t('error.magicLinkFilingError.description'),
    errorModalDescription2: t('error.magicLinkFilingError.description2')
  })
})
</script>
<template>
  <NuxtLayout name="dashboard">
    <div>
      <SbcLoadingSpinner v-if="isLoading" :overlay="true" />
      <template v-else>
        <DashboardContent />
      </template>
    </div>
  </NuxtLayout>
</template>
