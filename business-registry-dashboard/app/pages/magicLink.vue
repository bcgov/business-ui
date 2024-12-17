<script setup lang="ts">
import {
  NrRequestActionCodes,
  FilingTypes
} from '@bcrs-shared-components/enums'

const { t } = useI18n()
const brdModal = useBrdModals()
const route = useRoute()
const affNav = useAffiliationNavigation()
const { isAuthenticated } = useKeycloak()

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

// Handle magic link processing on component mount
onMounted(async () => {
  if (!isAuthenticated.value) {
    const authWebUrl = useRuntimeConfig().public.authWebUrl
    const redirectUrl = encodeURIComponent(window.location.href)
    window.location.href = `${authWebUrl}/login?redirect=${redirectUrl}`
  }

  try {
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

    // Verify business eligibility and proceed with incorporation
    if (business.nameRequest.requestActionCd === NrRequestActionCodes.NEW_BUSINESS &&
        ELIGIBLE_CORP_TYPES.includes(business.nameRequest.legalType)) {
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
    }
  } catch (error) {
    // Handle any unexpected errors during magic link processing
    console.error('Error processing magic link:', error)
    brdModal.openMagicLinkModal(
      t('error.magicLinkGenericError.title'),
      t('error.magicLinkGenericError.description')
    )
  }
})
</script>
<template>
  <NuxtLayout name="dashboard">
    <div>
      <BusinessLookup class="-mt-4" />
      <TableAffiliatedEntity class="mt-6" />
    </div>
  </NuxtLayout>
</template>
