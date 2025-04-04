<script setup lang='ts'>
import type { DropdownItem } from '#ui/types'
import {
  NrRequestActionCodes,
  FilingTypes,
  EntityStates
} from '@bcrs-shared-components/enums'

// Define a type for the response from createNamedBusiness to fix ts error
interface BusinessResponse {
  filing?: {
    business: {
      identifier: string
    }
  }
  errorMsg?: string
}

const affNav = useAffiliationNavigation()
const accountStore = useConnectAccountStore()
const affStore = useAffiliationsStore()
const { t } = useI18n()
const ldStore = useConnectLaunchdarklyStore()
const brdModal = useBrdModals()

const props = defineProps<{
  affiliations: Business[],
  item: Business,
  index: number
}>()

const emit = defineEmits<{
  'unknown-error': [void]
  'name-request-action-error': [void]
  'remove-business': [{ orgIdentifier: string, business: Business }]
  'business-unavailable-error': [action: string]
  'resend-affiliation-invitation': [item: Business]
  'show-manage-business-dialog': [item: ManageBusinessEvent]
}>()

const invalidStatuses = [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired, AffiliationInvitationStatus.Failed]
const isButtonActionProcessing = ref(false)

/** Create a business record in LEAR. */
async function createBusinessRecord (business: Business): Promise<string> {
  const amalgamationTypes = ldStore.getStoredFlag(LDFlags.SupportedAmalgamationEntities)?.split(' ') || []
  const continuationInTypes = ldStore.getStoredFlag(LDFlags.SupportedContinuationInEntities)?.split(' ') || []
  const supportedIaRegTypes = ldStore.getStoredFlag(LDFlags.IaSupportedEntitiesBrd)?.split(' ') || []

  let filingResponse: BusinessResponse | null = null
  let payload = null
  // If Incorporation or Registration
  if (business.nameRequest?.requestActionCd === NrRequestActionCodes.NEW_BUSINESS) {
    if (supportedIaRegTypes.includes(business.nameRequest?.legalType)) {
      // Determine if it's a registration or incorporation based on the legal type
      const isRegistrationType = [CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP].includes(business.nameRequest?.legalType)
      payload = {
        filingType: isRegistrationType ? FilingTypes.REGISTRATION : FilingTypes.INCORPORATION_APPLICATION,
        business
      }
    }
  } else if (business.nameRequest?.requestActionCd === NrRequestActionCodes.AMALGAMATE) { // If Amalgmation
    if (amalgamationTypes.includes(business.nameRequest?.legalType)) {
      payload = { filingType: FilingTypes.AMALGAMATION_APPLICATION, business }
    }
  } else if (business.nameRequest?.requestActionCd === NrRequestActionCodes.MOVE) {
    if (continuationInTypes.includes(business.nameRequest?.legalType)) {
      payload = { filingType: FilingTypes.CONTINUATION_IN, business }
    }
  }

  if (payload) {
    try {
      filingResponse = await createNamedBusiness(payload) as BusinessResponse
      if (filingResponse?.errorMsg) {
        // Handle explicit error message from API response and prevent navigation
        emit('unknown-error')
        return ''
      }
      return filingResponse?.filing?.business?.identifier || ''
    } catch (error) {
      // Log the error for debugging and emit event to show appropriate error dialog to user
      logFetchError(error, 'Failed to create business record')
      emit('name-request-action-error')
      return ''
    }
  }
  return ''
}

const showAffiliationInvitationNewRequestButton = (item: Business): boolean => {
  const invite = item.affiliationInvites?.[0]
  if (!invite) {
    return false
  }
  return (
    isCurrentOrganization(invite.fromOrg.id) &&
    invite.status !== AffiliationInvitationStatus.Accepted &&
    (invite.type === AffiliationInvitationType.REQUEST ||
    invite.type === AffiliationInvitationType.EMAIL)
  )
}

/** Remove business/nr affiliation or affiliation invitation. */
const removeAffiliationOrInvitation = async (item: Business) => {
  const invite = item.affiliationInvites?.[0]
  if (invite && invalidStatuses.includes(invite.status as AffiliationInvitationStatus)) {
    try {
      await affStore.removeInvite(invite.id)
      await affStore.loadAffiliations() // reload after deleting invite
    } catch (error) {
      logFetchError(error, 'Could not delete the invite at this time')
      emit('unknown-error') // TODO: better error handling?
    }
  } else {
    emit('remove-business', {
      orgIdentifier: accountStore.currentAccount.id,
      business: item
    })
  }
}

const disableTooltip = (item: Business): boolean => {
  if (affNav.isOpenExternal(item)) {
    if (isNameRequest(item)) {
      const nrRequestActionCd = item.nameRequest?.requestActionCd
      if (nrRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && isOtherEntities(item)) {
        return true
      }
    }
    return false
  }
  return true
}

const getTooltipText = (item: Business): string => {
  // For restore/renew cases when user is not staff
  if (item.nameRequest?.requestActionCd &&
      item.nameRequest.requestActionCd === NrRequestActionCodes.RESTORE &&
      !accountStore.isStaffOrSbcStaff) {
    return t('tooltips.submitForms')
  }

  // Default case
  return t('tooltips.affiliationActionBtn', {
    option: isSocieties(item) ? 'Societies Online' : 'Corporate Online'
  })
}

const getNrRequestDescription = (item: Business): string => {
  const nrRequestActionCd = item.nameRequest?.requestActionCd
  switch (nrRequestActionCd) {
    case NrRequestActionCodes.AMALGAMATE:
      return t('labels.amalgamateNow')
    case NrRequestActionCodes.CONVERSION:
      return t('labels.alterNow')
    case NrRequestActionCodes.CHANGE_NAME:
      return t('labels.changeNameNow')
    case NrRequestActionCodes.MOVE:
      return t('labels.continueInNow')
    case NrRequestActionCodes.NEW_BUSINESS:
      return isOtherEntities(item) ? t('labels.downloadForm') : t('labels.registerNow')
    case NrRequestActionCodes.RESTORE:
    case NrRequestActionCodes.RENEW:
      if (accountStore.isStaffOrSbcStaff) {
        return isForRestore(item) ? t('labels.restoreNow') : t('labels.reinstateNow')
      } else {
        return isForRestore(item) ? t('labels.stepsToRestore') : t('labels.stepsToReinstate')
      }
    default:
      return t('labels.openNameRequest')
  }
}

function getPrimaryActionLabel (item: Business): string {
  const invite = item?.affiliationInvites?.[0]
  if (invite && invalidStatuses.includes(invite?.status as AffiliationInvitationStatus)) {
    // checks for affiliation invitation
    switch (true) {
      case invite.type === AffiliationInvitationType.EMAIL &&
      [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired].includes(invite?.status as AffiliationInvitationStatus):
        return t('labels.resendEmail')

      case invite.type === AffiliationInvitationType.REQUEST &&
      AffiliationInvitationStatus.Pending === invite?.status &&
      isCurrentOrganization(invite.fromOrg.id) :
        return t('labels.cancelRequest')

      case invite.type === AffiliationInvitationType.REQUEST &&
      AffiliationInvitationStatus.Failed === invite?.status:
        return t('labels.removeFromList')
    }
  }

  if (isTemporaryBusiness(item)) {
    if (item?.draftStatus) {
      if (item.draftStatus === EntityStates.WITHDRAWN) {
        return t('labels.manageBusiness')
      }
      // For now seperating out Cont In's, but leaving in ability to switch messages to other filing types
      if (item.corpType.code === CorpTypes.CONTINUATION_IN) {
        switch (item.draftStatus) {
          case (EntityStates.DRAFT):
            return t('labels.resumeDraft')
          case (EntityStates.AWAITING_REVIEW):
          case (EntityStates.REJECTED) :
            return t('labels.openApplication')
          case (EntityStates.CHANGE_REQUESTED):
            return t('labels.makeChanges')
          case (EntityStates.APPROVED):
            return t('labels.resumeApplication')
          default:
            return t('labels.manageBusiness')
        }
      }
    }
    if (item.effectiveDate) {
      return t('labels.openApplication')
    }
    return t('labels.resumeDraft')
  }
  if (isNameRequest(item)) {
    const nrStatus = affiliationStatus(item)
    switch (nrStatus) {
      case NrDisplayStates.APPROVED:
        return getNrRequestDescription(item)
      case NrDisplayStates.REJECTED:
      case NrDisplayStates.CONSUMED:
      case NrDisplayStates.CANCELLED:
      case NrDisplayStates.REFUND_REQUESTED:
        return t('labels.removeFromTable')
      default:
        return t('labels.openNameRequest')
    }
  }
  return t('labels.manageBusiness')
}

const isShowRemoveAsPrimaryAction = (item: Business): boolean => {
  return isNameRequest(item) &&
      [NrDisplayStates.REJECTED, NrDisplayStates.CONSUMED,
        NrDisplayStates.CANCELLED, NrDisplayStates.REFUND_REQUESTED].includes(affiliationStatus(item) as NrDisplayStates)
}

const showRemoveButton = (item: Business): boolean => {
  return !isShowRemoveAsPrimaryAction(item)
}

const handleApprovedNameRequestRenew = async (item: Business): Promise<void> => {
  // Extract corporation number from the name request
  const corpNum = item.nameRequest?.corpNum
  if (!corpNum) { return } // Early return if no corpNum exists

  // If user is not staff, redirect to steps to restore page
  if (!accountStore.isStaffOrSbcStaff) {
    const stepsToRestoreURL = useRuntimeConfig().public.stepsToRestoreUrl
    navigateTo(stepsToRestoreURL, { open: { target: '_blank' } })
    return
  }

  // Show loading state while checking business existence
  isButtonActionProcessing.value = true
  const businessExists = await checkBusinessExistsInLear(corpNum)
  isButtonActionProcessing.value = false

  // Case 1: Business exists and is affiliated - go to dashboard
  if (businessExists && isBusinessAffiliated(props.affiliations, corpNum)) {
    affNav.goToDashboard(corpNum)
  } else if (!businessExists) { // Case 2: Business doesn't exist in LEAR - redirect to legacy system
    affNav.goToCorpOnline()
  } else {
    const action = isForRestore(item) ? 'restore' : 'reinstate'
    emit('business-unavailable-error', action)
  }
}

const handleApprovedNameRequestChangeName = async (item: Business, nrRequestActionCd: NrRequestActionCodes): Promise<void> => {
  // Extract corporation number from the name request
  const corpNum = item.nameRequest?.corpNum
  if (!corpNum) { return } // Early return if no corpNum exists

  // Show loading state while checking business existence
  isButtonActionProcessing.value = true
  const businessExists = await checkBusinessExistsInLear(corpNum)
  isButtonActionProcessing.value = false

  // Case 1: Business exists and is affiliated - go to dashboard
  if (businessExists && isBusinessAffiliated(props.affiliations, corpNum)) {
    affNav.goToDashboard(corpNum)
  } else if (!businessExists) { // Case 2: Business doesn't exist in LEAR - redirect to legacy system
    affNav.goToCorpOnline()
  } else { // Case 3: General error
    const action = nrRequestActionCd === NrRequestActionCodes.CONVERSION
      ? 'alter'
      : 'change name'
    emit('business-unavailable-error', action)
  }
}

const handleApprovedNameRequest = (item: Business, nrRequestActionCd?: NrRequestActionCodes): void => {
  switch (nrRequestActionCd) {
    case NrRequestActionCodes.AMALGAMATE:
      affNav.goToAmalgamate(item, createBusinessRecord)
      break
    case NrRequestActionCodes.MOVE: {
      affNav.goToContinuationIn(item, createBusinessRecord)
      break
    }
    case NrRequestActionCodes.CONVERSION:
    case NrRequestActionCodes.CHANGE_NAME:
      handleApprovedNameRequestChangeName(item, nrRequestActionCd)
      break
    case NrRequestActionCodes.RESTORE:
    case NrRequestActionCodes.RENEW:
      handleApprovedNameRequestRenew(item)
      break
    case NrRequestActionCodes.NEW_BUSINESS: {
      affNav.goToRegister(item, createBusinessRecord)
      break
    }
    default:
      if (item.nameRequest) {
        affNav.goToNameRequest(item.nameRequest)
      }
      break
  }
}

async function redirect (item: Business) {
  if (isTemporaryBusiness(item)) { // handle if temp business
    // Check for expired name requests
    if (isExpired(item, item.corpType.code === CorpTypes.CONTINUATION_IN ? CorpTypes.CONTINUATION_IN : undefined)) {
      // Use tempDescription to get the full application type name
      const applicationType = tempDescription(item)
      brdModal.openInvalidFilingApplication(applicationType)
      return
    }
    affNav.goToDashboard(item.businessIdentifier)
  } else if (isNameRequest(item)) { // handle if name request
    if (affiliationStatus(item) === NrDisplayStates.APPROVED) {
      const nrRequestActionCd = item.nameRequest?.requestActionCd
      handleApprovedNameRequest(item, nrRequestActionCd)
    } else {
      affNav.goToNameRequest(item.nameRequest)
    }
  } else if (isSocieties(item)) {
    affNav.goToSocieties()
  } else {
    await affStore.removeAcceptedAffiliationInvitations(item)
    affNav.goToDashboard(item.businessIdentifier)
  }
}

const primaryAction = async (item: Business): Promise<void> => {
  const invite = item?.affiliationInvites?.[0]
  const inviteStatus = invite?.status as AffiliationInvitationStatus | undefined
  const inviteType = invite?.type as AffiliationInvitationType | undefined

  if (invite && inviteStatus && invalidStatuses.includes(inviteStatus)) {
    if (
      inviteType === AffiliationInvitationType.EMAIL &&
      [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired].includes(inviteStatus)
    ) {
      emit('resend-affiliation-invitation', item)
      return
    }

    if (
      inviteType === AffiliationInvitationType.REQUEST &&
      ((inviteStatus === AffiliationInvitationStatus.Pending && isCurrentOrganization(invite.fromOrg.id)) ||
        inviteStatus === AffiliationInvitationStatus.Failed)
    ) {
      await removeAffiliationOrInvitation(item)
      return
    }
  }

  if (isShowRemoveAsPrimaryAction(item)) {
    await removeAffiliationOrInvitation(item)
  } else {
    redirect(item)
  }
}

/* eslint-disable-next-line */ // ignore item not being used
const showAmalgamateShortForm = (item: Business): boolean => {
  // reserve for changes in the future
  return false
}

// This is called when an affiliation invitation request already exists.
const openNewAffiliationInvite = (business: Business) => {
  const manageBusinessObject = {
    identifier: business.businessIdentifier,
    legalType: business.corpType.code ?? business.corpSubType?.code ?? undefined,
    name: business.name!
  }
  emit('show-manage-business-dialog', manageBusinessObject)
}

const showOpenButton = (item: Business): boolean => {
  return isNameRequest(item) &&
      ![NrDisplayStates.HOLD,
        NrDisplayStates.EXPIRED,
        NrDisplayStates.PROCESSING,
        NrDisplayStates.DRAFT].includes(affiliationStatus(item) as NrDisplayStates)
}

const showAffiliationInvitationCancelRequestButton = (item: Business): boolean => {
  const invite = item.affiliationInvites?.[0]
  return invite !== undefined &&
    invite.status !== AffiliationInvitationStatus.Accepted &&
    invite.type === AffiliationInvitationType.EMAIL
}

const moreActionsDropdownOptions = computed<DropdownItem[][]>(() => {
  const options = []
  if (showAffiliationInvitationNewRequestButton(props.item)) {
    options.push({
      label: t('labels.newRequest'),
      click: () => openNewAffiliationInvite(props.item),
      icon: 'i-mdi-refresh'
    })
  }

  if (showOpenButton(props.item)) {
    options.push({
      label: t('labels.openNameRequest'),
      click: () => affNav.goToNameRequest(props.item.nameRequest),
      icon: 'i-mdi-format-list-bulleted-square'
    })
  }

  if (showRemoveButton(props.item)) {
    if (isTemporaryBusiness(props.item) && !props.item.effectiveDate) {
      options.push({
        label: 'Delete ' + tempDescription(props.item), // TODO: do we want these to be translated?
        click: () => removeAffiliationOrInvitation(props.item),
        icon: 'i-mdi-delete-forever'
      })
    } else if (showAffiliationInvitationCancelRequestButton(props.item)) {
      options.push({
        label: t('labels.cancelRequest'),
        click: () => removeAffiliationOrInvitation(props.item),
        icon: 'i-mdi-window-close'
      })
    } else {
      options.push({
        label: t('labels.removeFromTable'),
        click: () => !props.item.effectiveDate && removeAffiliationOrInvitation(props.item),
        icon: 'i-mdi-delete',
        disabled: !!props.item.effectiveDate
      })
    }
  }

  if (showAmalgamateShortForm(props.item)) {
    options.push({
      label: t('labels.amalgamateNowShortForm'),
      click: () => showAmalgamateShortForm(props.item),
      icon: 'i-mdi-checkbox-multiple-blank-outline'
    })
  }
  return [options]
})

</script>
<template>
  <div
    :id="`action-menu-${index}`"
    class="mx-auto"
  >
    <UButtonGroup :ui="{ rounded: 'rounded' }">
      <UTooltip
        :text="getTooltipText(item)"
        :prevent="disableTooltip(item)"
        :popper="{ arrow: true }"
      >
        <UButton
          :label="getPrimaryActionLabel(item)"
          class="w-45 px-4 transition-all duration-200 hover:opacity-95 hover:brightness-125"
          :icon="affNav.isOpenExternal(item) ? 'i-mdi-open-in-new' : ''"
          :loading="isButtonActionProcessing"
          @click="primaryAction(item)"
        />
      </UTooltip>
      <UDropdown
        v-slot="{ open }"
        :items="moreActionsDropdownOptions"
        :ui="{
          width: 'min-w-fit',
          item: {
            base: 'group flex items-center gap-2 w-full',
            disabled: 'py-3 cursor-default opacity-50 font-normal',
            inactive: 'text-blue-500 dark:text-gray-200',
            icon: {
              base: 'flex-shrink-0 size-5',
              active: 'text-blue-500 dark:text-gray-400',
              inactive: 'text-blue-500'
            },
          }
        }"
      >
        <UButton
          class="border-l border-gray-300"
          :aria-label="$t('btn.moreOptions')"
        >
          <UIcon
            name="i-mdi-caret-down"
            class="scale-[1.75] transition-transform duration-200"
            :class="[open && 'rotate-180']"
          />
        </UButton>
      </UDropdown>
    </UButtonGroup>
  </div>
</template>
