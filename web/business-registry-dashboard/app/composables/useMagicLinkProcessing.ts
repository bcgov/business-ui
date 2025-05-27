import {
  NrRequestActionCodes,
  FilingTypes
} from '@bcrs-shared-components/enums'

export interface MagicLinkConfig {
  filingType: FilingTypes
  eligibleCorpTypes: CorpTypes[]
  requestActionCode: NrRequestActionCodes
  errorModalTitle: string
  errorModalDescription: string
  errorModalDescription2: string
}

// Define a type for the response from createNamedBusiness, this fixes the typescript error
interface BusinessResponse {
  filing: {
    business: {
      identifier: string
    }
  }
}

/**
 * Composable for handling magic link processing for business creation flows
 */
export function useMagicLinkProcessing () {
  const affNav = useAffiliationNavigation()
  const affStore = useAffiliationsStore()
  const brdModal = useBrdModals()
  const isLoading = ref(true)
  const route = useRoute()

  /**
   * Creates a new business from a Name Request
   * @param business - Business object containing corpType and nameRequest
   * @param filingType - The type of filing to create
   * @returns Promise<string> - The identifier of the newly created business
   */
  const createBusinessFromNR = async (business: any, filingType: FilingTypes): Promise<string> => {
    const payload = {
      filingType,
      business
    }

    const filingResponse = await createNamedBusiness(payload) as BusinessResponse
    return filingResponse.filing.business.identifier
  }

  /**
   * Process the magic link flow:
   * 1. Extract and validate URL parameters (nr, email, phone)
   * 2. Fetch name request details
   * 3. Create affiliation if not already affiliated
   * 4. Verify business eligibility
   * 5. Create business and redirect to dashboard if needed
   * @param config - Configuration for the magic link processing
   */
  const processMagicLink = async (config: MagicLinkConfig) => {
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
      const isEligibleRequest = business.nameRequest.requestActionCd === config.requestActionCode &&
        config.eligibleCorpTypes.includes(business.nameRequest.legalType) &&
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
        const identifier = await createBusinessFromNR(business, config.filingType)
        await affNav.goToDashboard(identifier)
      }
    } catch (error) {
      // All errors are handled with the magic link filing error modal
      console.error(`Error in ${config.filingType} flow:`, error)
      brdModal.openMagicLinkModal(
        config.errorModalTitle,
        config.errorModalDescription,
        config.errorModalDescription2
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    processMagicLink
  }
}
