import type { StandaloneTransitionFiling } from '~/interfaces/standalone-transition'
import { validate } from '~/utils/validate'

export const useStandaloneTransitionButtons = () => {
  const { scrollToOpenForm } = useEditFormHandlers()
  // submit final filing
  async function submitFiling() {
    const { errorModal } = useModal()
    const buttonControl = useButtonControl()
    const rtc = useRuntimeConfig().public
    const legalApi = useLegalApi2()

    const accountStore = useConnectAccountStore()
    const filingStore = usePostRestorationTransitionApplicationStore()
    const { draftFilingId } = storeToRefs(filingStore)

    const hasErrors = validate()

    if (scrollToOpenForm('submit')) {
      return
    }

    if (hasErrors) {
      return
    }

    const businessId = filingStore.activeBusiness.identifier

    const businessDashboardUrlWithBusinessAndAccount = computed(() =>
      `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`
    )

    try {
      // prevent submit if there is a form currently open
      const hasActiveForm = await filingStore.checkHasActiveForm('submit')
      if (hasActiveForm) {
        return
      }

      // set submit button as loading, disable all other bottom buttons
      buttonControl.handleButtonLoading(false, 'right', 1)

      // format payload
      const standAloneTransitionData = filingStore.getFilingPayload()
      if (!standAloneTransitionData) {
        // todo: failed to validate form properly ?
        return undefined
      }
      const businessIdentifier = filingStore.activeBusiness.identifier

      // clear ui properties (this is here to prevent them from being sent to the API)
      const shares = standAloneTransitionData.shareStructure.shareClasses.filter(share => !share.removed)
      for (const share in shares) {
        if (share.series) {
          share.series = share.series.filter(share => !share.removed)
        }
      }

      standAloneTransitionData.shareStructure.shareClasses = shares

      const payload = legalApi.createFilingPayload<StandaloneTransitionFiling>(
        filingStore.activeBusiness,
        'transition',
        standAloneTransitionData
      )
      if (!filingStore?.legalName) {
        // todo: throw modal warning
        return undefined
      }
      // payload.filing.header.certifiedBy = filingStore.legalName
      // if draft id exists, submit final payload as a PUT request to that filing and mark as not draft
      if (draftFilingId.value) {
        await legalApi.saveOrUpdateDraftFiling(
          businessIdentifier,
          payload,
          true,
          draftFilingId.value
        )
      } else {
        // submit as normal if no draft id
        await legalApi.postFiling(
          businessIdentifier,
          payload
        )
      }

      // navigate to business dashboard if filing does *not* fail
      await navigateTo(
        businessDashboardUrlWithBusinessAndAccount.value,
        { external: true }
      )
    } catch (error) {
      errorModal.open({
        error: error,
        i18nPrefix: 'modal.error.submitFiling'
      })
    } finally {
      buttonControl.handleButtonLoading(true)
    }
  }

  async function cancelFiling() {
    const { baseModal } = useModal()
    const rtc = useRuntimeConfig().public
    const t = useNuxtApp().$i18n.t

    const accountStore = useConnectAccountStore()
    const filingStore = usePostRestorationTransitionApplicationStore()

    const businessId = filingStore.activeBusiness.identifier

    const businessDashboardUrlWithBusinessAndAccount = computed(() =>
      `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`
    )

    if (await filingStore.checkHasChanges('save')) {
      await baseModal.open({
        title: t('modal.unsavedChanges.title'),
        description: t('modal.unsavedChanges.description'),
        dismissible: false,
        buttons: [
          { label: t('btn.keepEditing'), variant: 'outline', size: 'xl', shouldClose: true },
          {
            label: t('btn.exitWithoutSaving'),
            size: 'xl',
            onClick: async () => {
              await navigateTo(businessDashboardUrlWithBusinessAndAccount.value, {
                external: true
              })
            }
          }
        ]
      })
    } else {
      await navigateTo(
        businessDashboardUrlWithBusinessAndAccount.value,
        { external: true }
      )
    }
  }

  const saveFiling = async (resumeLater = false, disableActiveFormCheck = false) => {
    const { errorModal } = useModal()
    const buttonControl = useButtonControl()
    const rtc = useRuntimeConfig().public
    const urlParams = useUrlSearchParams()
    const legalApi = useLegalApi2()

    const accountStore = useConnectAccountStore()
    const filingStore = usePostRestorationTransitionApplicationStore()
    const { draftFilingId } = storeToRefs(filingStore)

    const businessId = filingStore.activeBusiness.identifier

    const businessDashboardUrlWithBusinessAndAccount = computed(() =>
      `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`
    )
    // disable active task check for saving filing on session timeout
    if (!disableActiveFormCheck) {
      // prevent save if there is a form currently open
      const hasActiveForm = await filingStore.checkHasActiveForm('save')
      if (hasActiveForm) {
        return
      }
    }
    const hasChanges = await filingStore.checkHasChanges('save')
    // prevent save if there are no changes
    if (!hasChanges) {
      // todo: update this
      await buttonControl.setAlertText(false, 'left', t('text.noChangesToSave'))
      return
    }
    try {
      // set appropriate button loading state
      if (resumeLater) {
        buttonControl.handleButtonLoading(false, 'left', 1)
      } else {
        buttonControl.handleButtonLoading(false, 'left', 0)
      }

      // format payload
      const standAloneTransitionData = filingStore.getFilingPayload()
      if (!standAloneTransitionData) {
        // Should never get here
        throw new Error('Error validating filing information.')
      }

      // save table state
      const payload = legalApi.createFilingPayload<StandaloneTransitionFiling>(
        filingStore.activeBusiness,
        'transition',
        standAloneTransitionData
      )

      // add folio number // TODO: validation?
      // todo: add folio ?
      // payload.filing.header.folioNumber = filingStore.folioNumber
      payload.filing.header.type = FilingHeaderType.NON_LEGAL

      // save filing as draft
      const res = await legalApi.saveOrUpdateDraftFiling(
        filingStore.activeBusiness.identifier,
        payload,
        false,
        draftFilingId.value as string
      )

      // update url with filing id
      // required if it's the first time 'save draft' was clicked
      // if page refreshes, the correct data will be reloaded
      draftFilingId.value = String(res.filing.header.filingId)
      urlParams.filingId = draftFilingId.value

      // if resume later, navigate back to business dashboard
      if (resumeLater) {
        await navigateTo(
          businessDashboardUrlWithBusinessAndAccount.value,
          { external: true }
        )
      }
    } catch (error) {
      errorModal.open({
        error: error,
        i18nPrefix: 'modal.error.submitFiling'
      })
    } finally {
      buttonControl.handleButtonLoading(true)
    }
  }

  return {
    cancelFiling,
    saveFiling,
    submitFiling
  }
}
