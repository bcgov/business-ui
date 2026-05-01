<script setup lang="ts">
import { inflate } from 'pako'
import { StatusCodes } from 'http-status-codes'

const { $businessApi, $authApi } = useNuxtApp()
const { t } = useNuxtApp().$i18n
const affStore = useAffiliationsStore()
const accountStore = useConnectAccountStore()
const brdModal = useBrdModals()
const route = useRoute()

// Token parsing
const parseToken = (encodedToken: string): AffiliationToken => {
  try {
    const isCompressed = encodedToken.startsWith('.')
    const parts = (isCompressed ? encodedToken.slice(1) : encodedToken).split('.')

    // parts[0] = payload, parts[1] = timestamp, parts[2] = signature
    // itsdangerous uses URL-safe base64, so convert back to standard base64
    let payload = parts[0]!.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (payload.length % 4) {
      payload += '='
    }
    let decoded = atob(payload)
    if (isCompressed) {
      // Need to zlib decompress — use pako or similar
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0))
      decoded = inflate(bytes, { to: 'string' })
    }
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to parse token:', error)
    throw new Error('Invalid token format')
  }
}

definePageMeta({
  checkMagicLink: true,
  order: 0
})

onMounted(async () => {
  try {
    const token = parseToken(route.query.token as string)
    // required when the user has more than 1 account
    // NB: `unaffiliated` token from migration will not have fromOrgId
    if (token.fromOrgId) {
      accountStore.switchCurrentAccount(token.fromOrgId)
    }
    // Parse the URL and try to add the affiliation
    parseUrlAndAddAffiliation(token, route.query.token as string)
    // Load affiliations to update the table
    await affStore.loadAffiliations()
  } catch (e) {
    console.error('Error accepting affiliation invitation:', e)
  }
})

// Function to parse the URL and extract the parameters, used for magic link email
const parseUrlAndAddAffiliation = async (token: any, base64Token: string) => {
  if (!route.meta.checkMagicLink) {
    return
  }
  const { businessIdentifier: identifier, id: invitationId, fromOrgId } = token

  try {
    // 1. Accept invitation
    const response = await affiliationInvitationService.acceptInvitation(invitationId, base64Token)

    // 2. Adding magic link success
    if (response.status === AffiliationInvitationStatus.Accepted) {
      await affStore.loadAffiliations()
      const business = affStore.affiliations.results.find(b => b.businessIdentifier === identifier)
      brdModal.openAddBusinessSuccess(affiliationName(business!) || identifier, identifier)
    }
  } catch (error: any) {
    console.error(error)
    const errorCode = error.response?._data?.code || error.response?._data?.rootCause?.code
    const errorStatus = error.response?.status
    const isBadRequest = errorStatus === StatusCodes.BAD_REQUEST
    const isExpired = errorCode === MagicLinkInvitationStatus.EXPIRED_AFFILIATION_INVITATION
    const isActioned = errorCode === MagicLinkInvitationStatus.ACTIONED_AFFILIATION_INVITATION

    // Email affiliation error when there is no fromOrgId (special migration flow affiliation)
    if (!fromOrgId && isBadRequest) {
      try {
        // In SAF + Affiliation flow, this link could have been used by another user or account
        // causing the invitation to be `ACCEPTED`, need to confirm business has been added to this account specifically
        if (isActioned) {
          const accountId = useConnectAccountStore().currentAccount.id
          const { entities } = await $authApi<{ entities: AffiliationResponse[] }>(`/orgs/${accountId}/affiliations?new=true`)
          const alreadyAdded = entities.find(b => b.identifier === identifier)

          if (alreadyAdded) {
            brdModal.openMagicLinkModal(t('error.magicLinkAlreadyAdded.title'), t('error.magicLinkAlreadyAdded.description', { identifier }))
            return
          }
        }

        // If link is expired, actioned by a different account or any other error, open manage business modal
        // prompting the user to send a new affiliation request
        // FUTURE: replace with business layer business store init (handles all mapping, typing, etc.)
        const businessInfo: {
          business: {
            legalType: string
            legalName: string,
            state: string
          }
        } = await $businessApi(`/businesses/${identifier}/public?slim=true`)

        const safErrorMap: Record<string, string> = {
          [MagicLinkInvitationStatus.EXPIRED_AFFILIATION_INVITATION]: 'expired',
          [MagicLinkInvitationStatus.ACTIONED_AFFILIATION_INVITATION]: 'actioned'
        }
        const safErrorType = safErrorMap[errorCode] || 'generic'

        brdModal.openManageBusiness(
          {
            identifier,
            legalType: businessInfo.business.legalType,
            name: businessInfo.business.legalName,
            status: businessInfo.business.state
          },
          {
            color: 'red',
            translationPath: `form.manageBusiness.safAffiliationAlert.${safErrorType}`,
            icon: 'i-mdi-warning',
            variant: 'subtle'
          },
          true
        )
      } catch (businessError: any) {
        console.error(businessError)
        brdModal.openBusinessAddError()
      }
      return
    }
    // Unauthorized
    if (errorStatus === StatusCodes.UNAUTHORIZED) {
      brdModal.openMagicLinkModal(t('error.magicLinkUnauthorized.title'), t('error.magicLinkUnauthorized.description'))
      return
    }
    // Expired
    if (isBadRequest && isExpired) {
      brdModal.openMagicLinkModal(t('error.magicLinkExpired.title'), t('error.magicLinkExpired.description', { identifier }))
      return
    }
    // Already Added
    if (isBadRequest && isActioned) {
      brdModal.openMagicLinkModal(t('error.magicLinkAlreadyAdded.title'), t('error.magicLinkAlreadyAdded.description', { identifier }))
      return
    }
    // Generic Error
    brdModal.openBusinessAddError()
  }
}
</script>
<template>
  <NuxtLayout name="dashboard">
    <DashboardContent />
  </NuxtLayout>
</template>
