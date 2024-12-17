<script setup lang="ts">
import {
  NrRequestActionCodes,
  FilingTypes
} from '@bcrs-shared-components/enums'

const { t } = useI18n()
const brdModal = useBrdModals()
const route = useRoute()
const affNav = useAffiliationNavigation()
const isLoading = ref(true)
const affStore = useAffiliationsStore()

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
 * 2. Extract and validate URL parameters (nrId, email, phone)
 * 3. Fetch name request details
 * 4. Verify business eligibility
 * 5. Create business and redirect to dashboard
 */
onMounted(async () => {
  try {
    isLoading.value = true
    // Extract query parameters from the URL
    const { nrId, email, phone } = route.query as { nrId: string, email: string, phone: string }

    // Ensure either email or phone is provided for contact
    if (!email && !phone) {
      brdModal.openMagicLinkModal(
        t('error.magicLinkMissingContactInfo.title'),
        t('error.magicLinkMissingContactInfo.description')
      )
      return
    }

    // Fetch name request details using provided credentials
    const nameRequest = await fetchNameRequest(nrId, phone, email)

    const business = {
      corpType: { code: nameRequest.legalType },
      nameRequest: {
        ...nameRequest,
        nrNumber: nameRequest.nrNum, // Transform nrNum to nrNumber
        requestActionCd: nameRequest.request_action_cd // Transform request_action_cd to requestActionCd
      }
    }

    // Load user's affiliated businesses and check if this name request is already affiliated
    // This prevents unauthorized access to name requests that belong to other users
    await affStore.loadAffiliations()
    const isAffiliated = isNameRequestAffiliated(affStore.affiliations.results, business.nameRequest?.nrNumber)

    // Verify business eligibility and proceed with incorporation
    if (business.nameRequest.requestActionCd === NrRequestActionCodes.NEW_BUSINESS &&
        ELIGIBLE_CORP_TYPES.includes(business.nameRequest.legalType) && isAffiliated) {
      try {
        // Create the business and redirect to dashboard
        const identifier = await createBusinessFromNR(business)
        await affNav.goToDashboard(identifier)
      } catch (error) {
        console.error('Error creating named business:', error)
        brdModal.openMagicLinkModal(
          t('error.magicLinkCreateBusinessFailed.title'),
          t('error.magicLinkCreateBusinessFailed.description')
        )
      }
    } else {
      brdModal.openMagicLinkModal(
        t('error.magicLinkInvalidNameRequest.title'),
        t('error.magicLinkInvalidNameRequest.description')
      )
    }
  } catch (error) {
    // Handle any unexpected errors during magic link processing
    console.error('Error processing magic link:', error)
    brdModal.openMagicLinkModal(
      t('error.magicLinkGenericError.title'),
      t('error.magicLinkGenericError.description')
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
        <BusinessLookup class="-mt-4" />
        <TableAffiliatedEntity class="mt-6" />
      </template>
    </div>
  </NuxtLayout>
</template>
