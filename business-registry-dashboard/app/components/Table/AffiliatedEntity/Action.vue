<script setup lang='ts'>
import type { DropdownItem } from '#ui/types'
import {
  NrRequestActionCodes,
  FilingTypes
  // NrRequestTypeCodes
} from '@bcrs-shared-components/enums'
// import AffiliationInvitationService from '@/services/affiliation-invitation.services'
// import launchdarklyServices from 'sbc-common-components/src/services/launchdarkly.services'

const props = defineProps<{
  item: Business,
  index: number
}>()

const emit = defineEmits(['show-manage-business-dialog', 'unknown-error', 'remove-affiliation-invitation',
  'remove-business', 'business-unavailable-error', 'resend-affiliation-invitation'])

const { isBusinessAffiliated } = useAffiliations()
const affNav = useAffiliationNavigation()
const accountStore = useConnectAccountStore()
const { t } = useI18n()

/** Create a business record in LEAR. */ // TODO: implement
async function createBusinessRecord (business: Business): Promise<string> {
  // const amalgamationTypes = launchdarklyServices.getFlag(LDFlags.SupportedAmalgamationEntities)?.split(' ') || []
  const ldAmalgTypes = 'BC BEN CC ULC' // use hardcoded for now
  const amalgamationTypes = ldAmalgTypes.split(' ') || []
  // const continuationInTypes = launchdarklyServices.getFlag(LDFlags.SupportedContinuationInEntities)?.split(' ') || []
  const ldContTypes = 'C CBEN CCC CUL' // use hardcoded for now
  const continuationInTypes = ldContTypes.split(' ') || []
  const regTypes = [CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP]
  const iaTypes = [CorpTypes.BENEFIT_COMPANY, CorpTypes.COOP, CorpTypes.BC_CCC, CorpTypes.BC_COMPANY,
    CorpTypes.BC_ULC_COMPANY]

  let filingResponse = null
  let payload = null
  // If Incorporation or Registration
  if (business.nameRequest?.requestActionCd === NrRequestActionCodes.NEW_BUSINESS) {
    if (regTypes.includes(business.nameRequest?.legalType)) {
      payload = { filingType: FilingTypes.REGISTRATION, business }
    } else if (iaTypes.includes(business.nameRequest?.legalType)) {
      payload = { filingType: FilingTypes.INCORPORATION_APPLICATION, business }
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
    // filingResponse = await businessStore.createNamedBusiness(payload)
    filingResponse = await createNamedBusiness(payload)
  }

  if (filingResponse?.errorMsg) {
    emit('unknown-error')
    return ''
  }
  return filingResponse.filing.business.identifier
}

const isOpenExternal = (item: Business): boolean => {
  const invitationStatus = item?.affiliationInvites?.[0]?.status

  if (invitationStatus && [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired].includes(invitationStatus as AffiliationInvitationStatus)) {
    return false
  }

  if (isTemporaryBusiness(item)) {
    return false
  }

  if (isNameRequest(item)) {
    const nrState = affiliationStatus(item)
    if (nrState !== NrDisplayStates.APPROVED) {
      return false
    }
    const nrRequestActionCd = item.nameRequest?.requestActionCd
    if (nrRequestActionCd === NrRequestActionCodes.NEW_BUSINESS) {
      return !isModernizedEntity(item)
    }
    // temporarily show external icon for continue in
    if (nrRequestActionCd === NrRequestActionCodes.MOVE) {
      return !isSupportedContinuationInEntities(item)
    }
    // temporary show external icon for amalgamate for some entity types
    if (nrRequestActionCd === NrRequestActionCodes.AMALGAMATE) {
      return !isSupportedAmalgamationEntities(item)
    }
    // temporarily show external icon for restore/reinstate for some entity types
    if (nrRequestActionCd === NrRequestActionCodes.RESTORE || nrRequestActionCd === NrRequestActionCodes.RENEW) {
      return !isSupportedRestorationEntities(item)
    }
    return false
  }

  // check for business
  return !isModernizedEntity(item)
}

// TODO: implement after adding affiliation invitations affiliation invitations
const showAffiliationInvitationNewRequestButton = (business: Business): boolean => {
  const affiliationInvitation = business.affiliationInvites?.[0]
  if (!affiliationInvitation) {
    return false
  }
  return (
    isCurrentOrganization(affiliationInvitation.fromOrg.id) &&
    affiliationInvitation.status !== AffiliationInvitationStatus.Accepted &&
    affiliationInvitation.type === AffiliationInvitationType.REQUEST
  )
}

/** Remove business/nr affiliation or affiliation invitation. */
const removeAffiliationOrInvitation = (business: Business) => {
  // if (business.affiliationInvites?.length > 0) { // TODO: add affiliation invitation option
  //   const affiliationInviteInfo = business.affiliationInvites[0]
  //   const invitationStatus = affiliationInviteInfo.status
  //   if ([AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Failed,
  //     AffiliationInvitationStatus.Expired].includes(invitationStatus as AffiliationInvitationStatus)) {
  //     const success = await AffiliationInvitationService.removeAffiliationInvitation(affiliationInviteInfo.id)
  //     if (!success) {
  //       context.emit('unknown-error')
  //     }
  //     context.emit('remove-affiliation-invitation')
  //     return
  //   }
  // }
  console.log('removeAffiliationOrInvitation')
  emit('remove-business', {
    orgIdentifier: accountStore.currentAccount.id,
    business
  })
}

const disableTooltip = (item: Business): boolean => {
  if (isOpenExternal(item)) {
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
      return isForRestore(item) ? t('labels.restoreNow') : t('labels.reinstateNow')
    case NrRequestActionCodes.RENEW:
      return t('labels.restoreNow')
    default:
      return t('labels.openNameRequest')
  }
}

// Actions
const getPrimaryActionLabel = (item: Business): string => {
  // const affiliationInviteInfo = item?.affiliationInvites?.[0] // TODO: add invitation invite options
  // if ([AffiliationInvitationStatus.Pending,
  //   AffiliationInvitationStatus.Expired,
  //   AffiliationInvitationStatus.Failed].includes(affiliationInviteInfo?.status)) {
  //   // checks for affiliation invitation
  //   switch (true) {
  //     case affiliationInviteInfo.type === AffiliationInvitationType.EMAIL &&
  //     [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired].includes(affiliationInviteInfo?.status):
  //       return 'Resend Email'

  //     case affiliationInviteInfo.type === AffiliationInvitationType.REQUEST &&
  //     AffiliationInvitationStatus.Pending === affiliationInviteInfo?.status &&
  //     isCurrentOrganization(item.affiliationInvites[0].fromOrg.id) :
  //       return 'Cancel Request' // 'Cancel<br>Request'

  //     case affiliationInviteInfo.type === AffiliationInvitationType.REQUEST &&
  //     AffiliationInvitationStatus.Failed === affiliationInviteInfo?.status:
  //       return 'Remove from list' // 'Remove<br>from list'
  //   }
  // }

  if (isTemporaryBusiness(item)) {
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
  return !isShowRemoveAsPrimaryAction(item) && !showAffiliationInvitationNewRequestButton(item)
}

const handleApprovedNameRequestRenew = (item: Business): void => {
  if (!isSupportedRestorationEntities(item)) {
    affNav.goToCorpOnline()
  } else if (item.nameRequest?.corpNum && isBusinessAffiliated(item.nameRequest?.corpNum)) {
    affNav.goToDashboard(item.nameRequest?.corpNum)
  } else {
    const action = isForRestore(item) ? 'restore' : 'reinstate'
    emit('business-unavailable-error', action)
  }
}

const handleApprovedNameRequestChangeName = (item: Business, nrRequestActionCd: NrRequestActionCodes): void => {
  if (!isModernizedEntity(item)) {
    affNav.goToCorpOnline()
  } else if (item.nameRequest?.corpNum && isBusinessAffiliated(item.nameRequest?.corpNum)) {
    affNav.goToDashboard(item.nameRequest?.corpNum)
  } else {
    let action = ''
    if (nrRequestActionCd === NrRequestActionCodes.CONVERSION) {
      action = 'alter'
    } else if (nrRequestActionCd === NrRequestActionCodes.CHANGE_NAME) {
      action = 'change name'
    }
    emit('business-unavailable-error', action)
  }
}

const handleApprovedNameRequest = (item: Business, nrRequestActionCd: NrRequestActionCodes): void => {
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

const handleNameRequestRedirect = (item: Business): boolean => {
  if (!isNameRequest(item)) {
    return false
  }
  if (affiliationStatus(item) === NrDisplayStates.APPROVED) {
    const nrRequestActionCd = item.nameRequest?.requestActionCd
    if (nrRequestActionCd) {
      handleApprovedNameRequest(item, nrRequestActionCd)
    }
    return true
  } else {
    if (item.nameRequest) {
      affNav.goToNameRequest(item.nameRequest)
    }
    return true
  }
}

/** Remove Accepted affiliation invitations from business. */
// const removeAcceptedAffiliationInvitations = (business: Business) => { // TODO: implement after adding affiliation invitations
//   const invitations = business.affiliationInvites || []
//   for (const affiliationInvitation of invitations) {
//     if (affiliationInvitation.status === AffiliationInvitationStatus.Accepted) {
//       AffiliationInvitationService.removeAffiliationInvitation(affiliationInvitation.id)
//     }
//   }
// }

const redirect = (item: Business) => {
  if (isTemporaryBusiness(item)) {
    console.log('temporary business redirect')
    affNav.goToDashboard(item.businessIdentifier)
  }
  if (handleNameRequestRedirect(item)) {
    console.log('handleNameRequestRedirect')
    return
  }
  if (isModernizedEntity(item)) {
    // removeAcceptedAffiliationInvitations(item) // TODO: implement
    affNav.goToDashboard(item.businessIdentifier)
    return true
  } else if (isSocieties(item)) {
    affNav.goToSocieties()
    return true
  } else {
    affNav.goToCorpOnline()
    return true
  }
}

// const action = (item: Business): Promise<void> => {
const action = async (item: Business): Promise<void> => {
  const affiliationInviteInfo = item?.affiliationInvites?.[0]
  if ([AffiliationInvitationStatus.Pending,
    AffiliationInvitationStatus.Expired,
    AffiliationInvitationStatus.Failed].includes(affiliationInviteInfo?.status as AffiliationInvitationStatus)) {
    switch (true) {
      case affiliationInviteInfo?.type === AffiliationInvitationType.EMAIL &&
          [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired]
            .includes(affiliationInviteInfo?.status as AffiliationInvitationStatus):
        emit('resend-affiliation-invitation', item)
        return

      case affiliationInviteInfo?.type === AffiliationInvitationType.REQUEST &&
          AffiliationInvitationStatus.Pending === affiliationInviteInfo?.status:
        // && // TODO: implement
        // isCurrentOrganization(item.affiliationInvites[0].fromOrg.id):
        await removeAffiliationOrInvitation(item)
        return

      case affiliationInviteInfo?.type === AffiliationInvitationType.REQUEST &&
          AffiliationInvitationStatus.Failed === affiliationInviteInfo?.status:
        await removeAffiliationOrInvitation(item)
        return
    }
  }

  if (isShowRemoveAsPrimaryAction(item)) {
    console.log('action clicked, show remove as primary action')
    removeAffiliationOrInvitation(item)
  } else {
    console.log('action clicked: redirect')
    redirect(item)
  }
}

const showAmalgamateShortForm = (item: Business): boolean => {
  // reserve for changes in the future
  return false
}

// This is called when an affiliation invitation request already exists.
// const openNewAffiliationInvite = (business: Business) => { // TODO: implement after adding affiliation invitations
//   businessStore.setRemoveExistingAffiliationInvitation(true)
//   context.emit('show-manage-business-dialog', business)
// }

const showOpenButton = (item: Business): boolean => {
  return isNameRequest(item) &&
      ![NrDisplayStates.HOLD,
        NrDisplayStates.EXPIRED,
        NrDisplayStates.PROCESSING,
        NrDisplayStates.DRAFT].includes(affiliationStatus(item) as NrDisplayStates)
}

const showAffiliationInvitationCancelRequestButton = (item: Business): boolean => { // TODO: implement after adding affiliation invitations
  const invite = item.affiliationInvites?.[0]
  return invite !== undefined &&
    invite.status !== AffiliationInvitationStatus.Accepted &&
    invite.type === AffiliationInvitationType.EMAIL
}

const moreActionsDropdownOptions = computed<DropdownItem[][]>(() => {
  const options = []
  if (showAffiliationInvitationNewRequestButton(props.item)) { // TODO: add affiliation invitations
    // do stuff click: () => openNewAffiliationInvite(props.item)
  }

  if (showOpenButton(props.item)) {
    options.push({
      label: t('labels.openNameRequest'),
      click: () => affNav.goToNameRequest(props.item.nameRequest),
      icon: 'i-mdi-format-list-bulleted-square'
    })
  }

  if (showRemoveButton(props.item)) {
    if (isTemporaryBusiness(props.item)) {
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
        click: () => removeAffiliationOrInvitation(props.item),
        icon: 'i-mdi-delete'
      })
    }
  }

  if (showAmalgamateShortForm(props.item)) { // TODO: implement after adding affiliation invitations showAmalgamation short form, add click funciton to option
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
    <UButtonGroup>
      <UTooltip
        :text="$t('tooltips.affiliationActionBtn', { option: isSocieties(item) ? 'Societies Online' : 'Corporate Online' })"
        :prevent="disableTooltip(item)"
        :popper="{ arrow: true }"
      >
        <UButton
          :label="getPrimaryActionLabel(item)"
          :icon="isOpenExternal(item) ? 'i-mdi-open-in-new' : ''"
          @click="action(item)"
        />
      </UTooltip>
      <UDropdown
        v-slot="{ open }"
        :items="moreActionsDropdownOptions"
        :ui="{
          width: 'min-w-fit',
          item: {
            base: 'group flex items-center gap-2 w-full',
            disabled: 'cursor-default opacity-100 font-semibold',
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
