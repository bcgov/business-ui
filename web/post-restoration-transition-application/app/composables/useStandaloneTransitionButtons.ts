import type { StandaloneTransitionFiling } from '~/interfaces/standalone-transition'
import { validate } from '~/utils/validate'

export const useStandaloneTransitionButtons = () => {
  const { scrollToOpenForm } = useEditFormHandlers()
  // submit final filing
  async function submitFiling() {
    const modal = useModal()
    const buttonControl = useButtonControl()
    const rtc = useRuntimeConfig().public
    const urlParams = useUrlSearchParams()
    const legalApi = useLegalApi2()

    const accountStore = useConnectAccountStore()
    const filingStore = usePostRestorationTransitionApplicationStore()

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

      // pull draft id from url or mark as undefined
      const draftId = (urlParams.draft as string) ?? undefined

      // format payload
      const standAloneTransitionData = filingStore.getFilingPayload()
      if (!standAloneTransitionData) {
        // todo: failed to validate form properly ?
        return undefined
      }
      const businessIdentifier = filingStore.activeBusiness.identifier

      // clear ui properties (this is here to prevent them from being sent to the API)
      const shareClassesData = standAloneTransitionData.shareStructure.shareClasses
      for (let i = shareClassesData.length - 1; i >= 0; i--) {
        if (shareClassesData[i].removed === true) {
          shareClassesData.splice(i, 1)
        } else {
          delete shareClassesData[i].added
          delete shareClassesData[i].modified
          delete shareClassesData[i].removed
          delete shareClassesData[i].parentShareIndex
          if (shareClassesData[i].series) {
            for (let j = shareClassesData[i].series.length - 1; j >= 0; j--) {
              if (shareClassesData[i].series[j].removed === true) {
                shareClassesData[i].series.splice(j, 1)
              } else {
                delete shareClassesData[i].series[j].added
                delete shareClassesData[i].series[j].modified
                delete shareClassesData[i].series[j].removed
                delete shareClassesData[i].series[j].parentShareIndex
              }
            }
          }
        }
      }
      standAloneTransitionData.shareStructure.shareClasses = shareClassesData

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
      if (draftId) {
        await legalApi.saveOrUpdateDraftFiling(
          businessIdentifier,
          payload,
          true,
          draftId
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
      modal.openBaseErrorModal(
        error,
        'modal.error.submitFiling'
      )
    } finally {
      buttonControl.handleButtonLoading(true)
    }
  }

  async function cancelFiling() {
    const modal = useModal()
    const rtc = useRuntimeConfig().public
    const t = useNuxtApp().$i18n.t

    const accountStore = useConnectAccountStore()
    const filingStore = usePostRestorationTransitionApplicationStore()

    const businessId = filingStore.activeBusiness.identifier

    const businessDashboardUrlWithBusinessAndAccount = computed(() =>
      `${rtc.businessDashboardUrl + businessId}?accountid=${accountStore.currentAccount.id}`
    )

    if (await filingStore.checkHasChanges('save')) {
      await modal.openBaseModal(
        t('modal.unsavedChanges.title'),
        t('modal.unsavedChanges.description'),
        false,
        [
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
      )
    } else {
      await navigateTo(
        businessDashboardUrlWithBusinessAndAccount.value,
        { external: true }
      )
    }
  }

  const saveFiling = async (resumeLater = false, disableActiveFormCheck = false) => {
    const modal = useModal()
    const buttonControl = useButtonControl()
    const rtc = useRuntimeConfig().public
    const urlParams = useUrlSearchParams()
    const legalApi = useLegalApi2()

    const accountStore = useConnectAccountStore()
    const filingStore = usePostRestorationTransitionApplicationStore()

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
      // setAlertText(false, 'left', t('text.noChangesToSave'))
      return
    }
    try {
      // set appropriate button loading state
      if (resumeLater) {
        buttonControl.handleButtonLoading(false, 'left', 1)
      } else {
        buttonControl.handleButtonLoading(false, 'left', 0)
      }

      // pull draft id from url or mark as undefined
      const draftId = (urlParams.draft as string) ?? undefined
      // check if the business has a pending filing before submit
      const pendingTask = await legalApi.getPendingTask(businessId, 'filing')
      if ((pendingTask && !draftId) || (draftId && draftId !== String(pendingTask?.filing.header.filingId))) {
        // TODO: how granular do we want to be with our error messages?
        // we check pending tasks on page mount
        // this will only occur if a pending task has been created after the initial page mount
        modal.openBaseErrorModal(
          undefined,
          'modal.error.pendingTaskOnSaveOrSubmit'
        )
        return
      }

      // format payload
      const standAloneTransitionData = filingStore.getFilingPayload()
      if (!standAloneTransitionData) {
        // todo: failed to validate form properly ?
        return undefined
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
        draftId
      )

      // update url with filing id
      // required if it's the first time 'save draft' was clicked
      // if page refreshes, the correct data will be reloaded
      urlParams.draft = String(res.filing.header.filingId)

      // if resume later, navigate back to business dashboard
      if (resumeLater) {
        await navigateTo(
          businessDashboardUrlWithBusinessAndAccount.value,
          { external: true }
        )
      }
    } catch (error) {
      modal.openBaseErrorModal(
        error,
        'modal.error.submitFiling'
      )
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
