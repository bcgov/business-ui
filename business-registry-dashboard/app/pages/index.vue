<script setup lang="ts">
import { useRoute } from 'vue-router'

const { t } = useI18n()
const affStore = useAffiliationsStore()
const brdModal = useBrdModals()
const route = useRoute()
const toast = useToast()

definePageMeta({
  checkMagicLink: true,
  order: 0
})

// Token parsing
const parseToken = (encodedToken: string): AffiliationToken => {
  try {
    const tokenObject = encodedToken.split('.')[0]
    const decoded = atob(tokenObject as string)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to parse token:', error)
    throw new Error('Invalid token format')
  }
}

onMounted(async () => {
  console.log('affiliationToken', sessionStorage.getItem('affiliationToken'))
  console.log('to.path', sessionStorage.getItem('to.path'))
  // Handle token acceptance if token parameter exists
  if (sessionStorage.getItem('affiliationToken')) {
    const affiliationToken = sessionStorage.getItem('affiliationToken') as string
    sessionStorage.removeItem('affiliationToken')
    try {
      const parsedToken = parseToken(affiliationToken)
      // Parse the URL and try to add the affiliation
      parseUrlAndAddAffiliation(parsedToken, affiliationToken)
      // Load affiliations to update the table
      await affStore.loadAffiliations()
    } catch (e) {
      console.error('Error accepting affiliation invitation:', e)
    }
  }
})

// Function to parse the URL and extract the parameters, used for magic link email
const parseUrlAndAddAffiliation = async (token: any, base64Token: string) => {
  if (!route.meta.checkMagicLink) {
    return
  }
  const { businessIdentifier: identifier, id: invitationId } = token

  try {
    // 1. Accept invitation
    const response = await affiliationInvitationService.acceptInvitation(invitationId, base64Token)

    // 2. Adding magic link success
    if (response.status === AffiliationInvitationStatus.Accepted) {
      toast.add({ title: t('modal.manageBusiness.success.toast', { identifier }) }) // add success toast
    }
  } catch (error: any) {
    console.error(error)
    // 3. Unauthorized
    if (error.response?.status === 401) {
      brdModal.openMagicLinkModal(t('error.magicLinkUnauthorized.title'), t('error.magicLinkUnauthorized.description'))
      return
    }
    // 4. Expired
    if (error.response?.status === 400 &&
      error.response?._data.code === MagicLinkInvitationStatus.EXPIRED_AFFILIATION_INVITATION) {
      brdModal.openMagicLinkModal(t('error.magicLinkExpired.title'), t('error.magicLinkExpired.description', { identifier }))
      return
    }
    // 5. Already Added
    if (error.response?.status === 400 &&
      error.response?._data.code === MagicLinkInvitationStatus.ACTIONED_AFFILIATION_INVITATION) {
      brdModal.openMagicLinkModal(t('error.magicLinkAlreadyAdded.title'), t('error.magicLinkAlreadyAdded.description', { identifier }))
      return
    }
    // 6. Generic Error
    brdModal.openBusinessAddError()
  }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <div>
      <BusinessLookup class="-mt-4" />
      <TableAffiliatedEntity />
    </div>
  </NuxtLayout>
</template>
