<script setup lang="ts">
import {
  NrRequestActionCodes,
  FilingTypes
} from '@bcrs-shared-components/enums'

const { t } = useI18n()
const affNav = useAffiliationNavigation()
const affStore = useAffiliationsStore()
const brdModal = useBrdModals()
const isLoading = ref(true)
const route = useRoute()

// Define eligible corporation types for incorporation
const ELIGIBLE_CORP_TYPES = [
  CorpTypes.BENEFIT_COMPANY,
  CorpTypes.COOP,
  CorpTypes.BC_CCC,
  CorpTypes.BC_COMPANY,
  CorpTypes.BC_ULC_COMPANY
]

definePageMeta({ order: 0 })

/**
 * Creates a new business from a Name Request
 * @param business - Business object containing corpType and nameRequest
 * @returns Promise<string> - The identifier of the newly created business
 */
const createBusinessFromNR = async (business: any) => {
  const payload = {
    filingType: FilingTypes.INCORPORATION_APPLICATION,
    business
  }

  const filingResponse = await createNamedBusiness(payload)
  return filingResponse.filing.business.identifier
}

/**
 * Magic Link Processing Flow:
 * 1. Verify user authentication (done in dashboard layout)
 * 2. Extract and validate URL parameters (nr, email, phone)
 * 3. Fetch name request details
 * 4. Create affiliation if not already affiliated
 * 5. Verify business eligibility
 * 6. Create business and redirect to dashboard if needed
 */
onMounted(async () => {
  try {
    isLoading.value = true
    // Extract query parameters from the URL
    const { nr, email, phone } = route.query as { nr: string, email: string, phone: string }

    // Ensure either email or phone is provided as contact information
    if (!email && !phone) {
      throw new Error('Missing contact information')
    }

    // Fetch and validate name request details
    const nameRequest = await fetchNameRequest(nr, phone, email)

    // Transform name request data to match expected business structure
    const business = {
      corpType: { code: nameRequest.legalType },
      nameRequest: {
        ...nameRequest,
        nrNumber: nameRequest.nrNum, // Transform nrNum to nrNumber
        requestActionCd: nameRequest.request_action_cd // Transform request_action_cd to requestActionCd
      }
    }

    // Before the affiliation checks, add a guard clause
    if (!business.nameRequest?.nrNumber) {
      throw new Error('Name request number is required')
    }

    // Now TypeScript knows nrNumber is defined for all following uses
    const nrNumber = business.nameRequest.nrNumber

    // Check basic eligibility conditions
    const isEligibleRequest = business.nameRequest.requestActionCd === NrRequestActionCodes.NEW_BUSINESS &&
      ELIGIBLE_CORP_TYPES.includes(business.nameRequest.legalType) &&
      !!nameRequest.expirationDate

    if (!isEligibleRequest) {
      throw new Error('Invalid name request')
    }

    // Load and check if the NR is already affiliated
    await affStore.loadAffiliations()
    const isAffiliated = isNameRequestAffiliated(affStore.affiliations.results, nrNumber)

    // Create affiliation if it doesn't exist
    if (!isAffiliated) {
      await affStore.createNRAffiliation({
        businessIdentifier: nrNumber,
        ...(phone && { phone }),
        ...(email && { email })
      })
    }

    // Get the temporary business identifier if it exists
    const tempBusinessIdentifier = getTempBusinessIdentifierOfNameRequest(affStore.affiliations.results, nrNumber)

    // If the NR is already affiliated and a draft business exists, navigate to the dashboard with the temporary business identifier
    if (tempBusinessIdentifier) {
      await affNav.goToDashboard(tempBusinessIdentifier)
    } else {
      // Otherwise, create a new business and navigate to the dashboard with the new temporary business identifier
      const identifier = await createBusinessFromNR(business)
      await affNav.goToDashboard(identifier)
    }
  } catch (error) {
    // All errors are handled with the incorporate now error modal
    console.error('Error in incorporate flow:', error)
    brdModal.openMagicLinkModal(
      t('error.magicLinkIncorporateNowError.title'),
      t('error.magicLinkIncorporateNowError.description'),
      t('error.magicLinkIncorporateNowError.description2')
    )
  } finally {
    isLoading.value = false
  }
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
