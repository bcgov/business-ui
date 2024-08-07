<script setup lang='ts'>
import type { PropType } from 'vue'
import type { DropdownItem } from '#ui/types'
import {
  NrRequestActionCodes
  // FilingTypes
  // NrRequestTypeCodes
} from '@bcrs-shared-components/enums'
// import AffiliationInvitationService from '@/services/affiliation-invitation.services'
// import launchdarklyServices from 'sbc-common-components/src/services/launchdarkly.services'

const props = defineProps({
  item: { type: Object as PropType<Business>, required: true },
  index: { type: Number, required: true }
})

const emit = defineEmits(['show-manage-business-dialog', 'unknown-error', 'remove-affiliation-invitation',
  'remove-business', 'business-unavailable-error', 'resend-affiliation-invitation'])

const { affiliations } = useAffiliations()
const affNav = useAffiliationNavigation()
const accountStore = useConnectAccountStore()

/** Create a business record in LEAR. */ // TODO: implement
// const createBusinessRecord = async (business: Business): Promise<string> => {
//   // const amalgamationTypes = launchdarklyServices.getFlag(LDFlags.SupportedAmalgamationEntities)?.split(' ') || []
//   // const continuationInTypes = launchdarklyServices.getFlag(LDFlags.SupportedContinuationInEntities)?.split(' ') || []
//   const regTypes = [CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP]
//   const iaTypes = [CorpTypes.BENEFIT_COMPANY, CorpTypes.COOP, CorpTypes.BC_CCC, CorpTypes.BC_COMPANY,
//     CorpTypes.BC_ULC_COMPANY]

//   let filingResponse = null
//   let payload = null
//   // If Incorporation or Registration
//   if (business.nameRequest?.requestActionCd === NrRequestActionCodes.NEW_BUSINESS) {
//     if (regTypes.includes(business.nameRequest?.legalType)) {
//       payload = { filingType: FilingTypes.REGISTRATION, business }
//     } else if (iaTypes.includes(business.nameRequest?.legalType)) {
//       payload = { filingType: FilingTypes.INCORPORATION_APPLICATION, business }
//     }
//   }
//   // else if (business.nameRequest?.requestActionCd === NrRequestActionCodes.AMALGAMATE) { // If Amalgmation
//   //   if (amalgamationTypes.includes(business.nameRequest?.legalType)) {
//   //     payload = { filingType: FilingTypes.AMALGAMATION_APPLICATION, business }
//   //   }
//   // } else if (business.nameRequest?.requestActionCd === NrRequestActionCodes.MOVE) {
//   //   if (continuationInTypes.includes(business.nameRequest?.legalType)) {
//   //     payload = { filingType: FilingTypes.CONTINUATION_IN, business }
//   //   }
//   // }

//   if (payload) {
//     filingResponse = await businessStore.createNamedBusiness(payload)
//   }

//   if (filingResponse?.errorMsg) {
//     emit('unknown-error')
//     return ''
//   }
//   return filingResponse.data.filing.business.identifier
// }

// TODO: add launch darkly
// const isModernizedEntity = (item: Business): boolean => {
//   const entityType = getEntityType(item)
//   const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.IaSupportedEntities)?.split(' ') || []
//   return supportedEntityFlags.includes(entityType)
// }

// TODO: add launch darkly
// const isSupportedAmalgamationEntities = (item: Business): boolean => {
//   const entityType = getEntityType(item)
//   const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.SupportedAmalgamationEntities)?.split(' ') || []
//   return supportedEntityFlags.includes(entityType)
// }

// TODO: add launch darkly
// const isSupportedContinuationInEntities = (item: Business): boolean => {
//   const entityType = getEntityType(item)
//   const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.SupportedContinuationInEntities)?.split(' ') || []
//   return supportedEntityFlags.includes(entityType)
// }

// TODO: add launch darkly
// const isSupportedRestorationEntities = (item: Business): boolean => {
//   const entityType = getEntityType(item)
//   const supportedEntityFlags = launchdarklyServices.getFlag(LDFlags.SupportRestorationEntities)?.split(' ') || []
//   return supportedEntityFlags.includes(entityType)
// }

const isOpenExternal = (item: Business): boolean => {
  const invitationStatus = item?.affiliationInvites?.[0]?.status

  const isValidStatus = (status: string): status is AffiliationInvitationStatus => {
    return Object.values(AffiliationInvitationStatus).includes(status as AffiliationInvitationStatus)
  }

  if (invitationStatus && isValidStatus(invitationStatus) && [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired].includes(invitationStatus)) {
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
    // const nrRequestActionCd = item.nameRequest?.requestActionCd
    // if (nrRequestActionCd === NrRequestActionCodes.NEW_BUSINESS) {
    //   return !isModernizedEntity(item) // TODO: implement after adding affiliation invitations after adding launch darkly
    // }
    // // temporarily show external icon for continue in
    // if (nrRequestActionCd === NrRequestActionCodes.MOVE) {
    //   return !isSupportedContinuationInEntities(item) // TODO: implement after adding affiliation invitations after adding launch darkly
    // }
    // // temporary show external icon for amalgamate for some entity types
    // if (nrRequestActionCd === NrRequestActionCodes.AMALGAMATE) {
    //   return !isSupportedAmalgamationEntities(item) // TODO: implement after adding affiliation invitations after adding launch darkly
    // }
    // // temporarily show external icon for restore/reinstate for some entity types
    // if (nrRequestActionCd === NrRequestActionCodes.RESTORE ||
    //       nrRequestActionCd === NrRequestActionCodes.RENEW) {
    //   return !isSupportedRestorationEntities(item) // TODO: implement after adding affiliation invitations after adding launch darkly
    // }
    return false
  }

  return false

  // check for business
  // return !isModernizedEntity(item) // TODO: add launch darkly
}

const getTooltipTargetDescription = (item: Business): string => {
  return isSocieties(item) ? 'Societies Online' : 'Corporate Online'
}

// TODO: implement after adding affiliation invitations affiliation invitations
// const showAffiliationInvitationNewRequestButton = (business: Business): boolean =>
// const showAffiliationInvitationNewRequestButton = (business: Business): boolean => {
//   const affiliationInvitation = business.affiliationInvites?.[0]
//   if (!affiliationInvitation) {
//     return false
//   }
//   return (
//     isCurrentOrganization(affiliationInvitation.fromOrg.id) &&
//     affiliationInvitation.status !== AffiliationInvitationStatus.Accepted &&
//     affiliationInvitation.type === AffiliationInvitationType.REQUEST
//   )
// }

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
      return 'Amalgamate Now'
    case NrRequestActionCodes.CONVERSION:
      return 'Alter Now'
    case NrRequestActionCodes.CHANGE_NAME:
      return 'Change Name Now'
    case NrRequestActionCodes.MOVE:
      return 'Continue In Now'
    case NrRequestActionCodes.NEW_BUSINESS:
      return isOtherEntities(item) ? 'Download Form' : 'Register Now'
    case NrRequestActionCodes.RESTORE:
      return isForRestore(item) ? 'Restore Now' : 'Reinstate Now'
    case NrRequestActionCodes.RENEW:
      return 'Restore Now'
    default:
      return 'Open Name Request'
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
    return 'Resume Draft'
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
        return 'Remove From Table'
      default:
        return 'Open Name Request'
    }
  }
  return 'Manage Business'
}

const isShowRemoveAsPrimaryAction = (item: Business): boolean => {
  return isNameRequest(item) &&
      [NrDisplayStates.REJECTED, NrDisplayStates.CONSUMED,
        NrDisplayStates.CANCELLED, NrDisplayStates.REFUND_REQUESTED].includes(affiliationStatus(item) as NrDisplayStates)
}

const showRemoveButton = (item: Business): boolean => {
  // return !isShowRemoveAsPrimaryAction(item) && !showAffiliationInvitationNewRequestButton(item) // TODO: implement after adding affiliation invitations
  return !isShowRemoveAsPrimaryAction(item)
}

const handleTemporaryBusinessRedirect = (item: Business): boolean => {
  if (isTemporaryBusiness(item)) {
    affNav.goToDashboard(item.businessIdentifier)
    return true
  }
  return false
}

const isBusinessAffiliated = (businessIdentifier: string): boolean => {
  if (!businessIdentifier) {
    return false
  }
  return affiliations.results.some(business => businessIdentifier === business.businessIdentifier)
}

const handleApprovedNameRequestRenew = (item: Business): void => {
  // if (!isSupportedRestorationEntities(item)) { // TODO: implement after adding launch darkly
  //   goToCorpOnline()
  // } else if (isBusinessAffiliated(item.nameRequest?.corpNum)) {
  if (item.nameRequest?.corpNum && isBusinessAffiliated(item.nameRequest?.corpNum)) {
    affNav.goToDashboard(item.nameRequest?.corpNum)
  } else {
    const action = isForRestore(item) ? 'restore' : 'reinstate'
    emit('business-unavailable-error', action)
  }
}

const handleApprovedNameRequestChangeName = (item: Business, nrRequestActionCd: NrRequestActionCodes): void => {
  // if (!isModernizedEntity(item)) { // TODO: implement after adding launch darkly
  //   goToCorpOnline()
  // } else if (isBusinessAffiliated(item.nameRequest?.corpNum)) {
  if (item.nameRequest?.corpNum && isBusinessAffiliated(item.nameRequest?.corpNum)) {
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
      // goToAmalgamate(item)
      affNav.goToAmalgamate()
      break
    case NrRequestActionCodes.MOVE: {
      // goToContinuationIn(item)
      affNav.goToContinuationIn()
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
      affNav.goToRegister(item)
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

const handleBusinessRedirect = (item: Business): boolean => {
  if (isNameRequest(item)) {
    return false
  }
  // if (isModernizedEntity(item)) { // TODO: implement after adding launch darkly
  //   // removeAcceptedAffiliationInvitations(item)
  //   goToDashboard(item.businessIdentifier)
  //   return true
  // } else if (isSocieties(item)) {
  if (isSocieties(item)) {
    affNav.goToSocieties()
    return true
  } else {
    affNav.goToCorpOnline()
    return true
  }
}

const redirect = (item: Business) => {
  if (handleTemporaryBusinessRedirect(item)) {
    console.log('handleTemporaryBusinessRedirect(')
    return
  }
  if (handleNameRequestRedirect(item)) {
    console.log('handleNameRequestRedirect')
    return
  }
  console.log('handleBusinessRedirect')
  handleBusinessRedirect(item)
}

// const action = (item: Business): Promise<void> => {
const action = (item: Business): void => {
  // const affiliationInviteInfo = item?.affiliationInvites?.[0]
  // if ([AffiliationInvitationStatus.Pending,
  //   AffiliationInvitationStatus.Expired,
  //   AffiliationInvitationStatus.Failed].includes(affiliationInviteInfo?.status as AffiliationInvitationStatus)) {
  //   switch (true) {
  //     case affiliationInviteInfo.type === AffiliationInvitationType.EMAIL &&
  //         [AffiliationInvitationStatus.Pending, AffiliationInvitationStatus.Expired]
  //           .includes(affiliationInviteInfo?.status as AffiliationInvitationStatus):
  //       context.emit('resend-affiliation-invitation', item)
  //       return

  //     case affiliationInviteInfo.type === AffiliationInvitationType.REQUEST &&
  //         AffiliationInvitationStatus.Pending === affiliationInviteInfo?.status &&
  //         isCurrentOrganization(item.affiliationInvites[0].fromOrg.id) :
  //       await removeAffiliationOrInvitation(item)
  //       return

  //     case affiliationInviteInfo.type === AffiliationInvitationType.REQUEST &&
  //         AffiliationInvitationStatus.Failed === affiliationInviteInfo?.status:
  //       await removeAffiliationOrInvitation(item)
  //       return
  //   }
  // }

  if (isShowRemoveAsPrimaryAction(item)) {
    console.log('action clicked, show remove as primary action')
    removeAffiliationOrInvitation(item)
  } else {
    console.log('action clicked: redirect')
    redirect(item)
  }
}

// const showAmalgamateShortForm = (item: Business): boolean => {
const showAmalgamateShortForm = (): boolean => {
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

// const showAffiliationInvitationCancelRequestButton = (item: Business): boolean => { // TODO: implement after adding affiliation invitations
//   return item.affiliationInvites?.length > 0 &&
//         item.affiliationInvites[0].status !== AffiliationInvitationStatus.Accepted &&
//           item.affiliationInvites[0].type === AffiliationInvitationType.EMAIL
// }

const moreActionsDropdownOptions = computed<DropdownItem[][]>(() => {
  const options = []
  // if (showAffiliationInvitationNewRequestButton(item)) { // TODO: add affiliation invitations
  //   // do stuff click: () => openNewAffiliationInvite(props.item)
  // }

  if (showOpenButton(props.item)) {
    options.push({
      label: 'Open Name Request',
      click: () => affNav.goToNameRequest(props.item.nameRequest),
      icon: 'i-mdi-format-list-bulleted-square'
    })
  }

  if (showRemoveButton(props.item)) {
    if (isTemporaryBusiness(props.item)) {
      options.push({
        label: 'Delete ' + tempDescription(props.item),
        click: () => removeAffiliationOrInvitation(props.item),
        icon: 'i-mdi-delete-forever'
      })
    // } else if (showAffiliationInvitationCancelRequestButton(props.item)) { // TODO: add affiliation invitation option
    //   options.push({
    //     label: 'Cancel Request',
    //     click: () => removeAffiliationOrInvitation(props.item),
    //     icon: 'i-mdi-window-close'
    //   })
    } else {
      options.push({
        label: 'Remove From Table',
        click: () => removeAffiliationOrInvitation(props.item),
        icon: 'i-mdi-delete'
      })
    }
  }

  if (showAmalgamateShortForm()) { // TODO: implement after adding affiliation invitations showAmalgamation short form, add click funciton to option
    options.push({
      label: 'Amalgamate Now (Short Form)',
      click: () => console.log('amalgamate now short form clicked'),
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
        :text="`Go to ${getTooltipTargetDescription(item)} to access this business`"
        :prevent="disableTooltip(item)"
        :popper="{ arrow: true }"
      >
        <UButton
          :label="getPrimaryActionLabel(item)"
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
        <UButton class="border-l border-gray-300">
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
