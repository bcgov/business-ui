<script setup lang="ts">
import { inflate } from 'pako'
import { StatusCodes } from 'http-status-codes'

const { $businessApi } = useNuxtApp()
const { t } = useNuxtApp().$i18n
const affStore = useAffiliationsStore()
const brdModal = useBrdModals()
const route = useRoute()
const toast = useToast()

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
      toast.add({ title: t('modal.manageBusiness.success.toast', { identifier }) }) // add success toast
    }
  } catch (error: any) {
    console.error(error)
    // Generic email affiliation error when there is no fromOrgId (special migration flow affiliation)
    if (
      !fromOrgId &&
      !(
        error.response?.status === StatusCodes.BAD_REQUEST &&
        error.response?._data?.rootCause?.code === MagicLinkInvitationStatus.ACTIONED_AFFILIATION_INVITATION
      )
    ) {
      try {
        // FUTURE: replace with business layer business store init (handles all mapping, typing, etc.)
        const businessInfo: {
          business: {
            legalType: string
            legalName: string,
            state: string
          }
        } = await $businessApi(`/businesses/${identifier}/public?slim=true`)

        brdModal.openManageBusiness({
          identifier,
          legalType: businessInfo.business.legalType,
          name: businessInfo.business.legalName,
          status: businessInfo.business.state
        }, {
          color: 'red',
          translationPath: 'form.manageBusiness.expiredLink',
          icon: 'i-mdi-warning',
          variant: 'subtle'
        })
      } catch (businessError: any) {
        console.error(businessError)
        brdModal.openBusinessAddError()
      }
      return
    }
    // Unauthorized
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      brdModal.openMagicLinkModal(t('error.magicLinkUnauthorized.title'), t('error.magicLinkUnauthorized.description'))
      return
    }
    // Expired
    if (error.response?.status === StatusCodes.BAD_REQUEST &&
      error.response?._data?.rootCause?.code === MagicLinkInvitationStatus.EXPIRED_AFFILIATION_INVITATION) {
      brdModal.openMagicLinkModal(t('error.magicLinkExpired.title'), t('error.magicLinkExpired.description', { identifier }))
      return
    }
    // Already Added
    if (error.response?.status === StatusCodes.BAD_REQUEST &&
      error.response?._data?.rootCause?.code === MagicLinkInvitationStatus.ACTIONED_AFFILIATION_INVITATION) {
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
