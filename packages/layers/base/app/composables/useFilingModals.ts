export const useFilingModals = () => {
  const { baseModal, errorModal } = useModal()
  const t = useNuxtApp().$i18n.t
  const rtc = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const { dashboardUrl } = useFilingNavigation()

  async function openUnsavedChangesModal(revokeBeforeUnloadEvent: (() => void) | null) {
    await baseModal.open({
      title: t('modal.unsavedChanges.title'),
      description: t('modal.unsavedChanges.description'),
      dismissible: false,
      buttons: [
        { label: t('label.keepEditing'), variant: 'outline', size: 'xl', shouldClose: true },
        {
          label: t('label.exitWithoutSaving'),
          size: 'xl',
          onClick: async () => {
            if (revokeBeforeUnloadEvent) {
              revokeBeforeUnloadEvent()
            }
            await navigateTo(dashboardUrl.value, {
              external: true
            })
          }
        }
      ]
    })
  }

  /** A submission hit 409 - the work is parked as a draft; review reloads the page to rebase it */
  async function openDraftStaleModal() {
    await baseModal.open({
      title: t('modal.draftRebase.stale.title'),
      description: t('modal.draftRebase.stale.description'),
      dismissible: true,
      buttons: [
        {
          label: t('label.returnToMyBusiness'),
          size: 'xl',
          variant: 'outline',
          to: dashboardUrl.value,
          external: true
        },
        { label: t('label.reviewChanges'), size: 'xl', onClick: () => window.location.reload() }
      ]
    })
  }

  async function openSaveFilingErrorModal(error: unknown, preferApiMessage = false) {
    // stale rebase base: the draft was parked, the form no longer reflects the business
    if (getErrorStatus(error) === 409 && useDraftRebase().staleOnSave.value) {
      return openDraftStaleModal()
    }
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.filing.submit',
      preferErrorMessage: preferApiMessage
    })
  }

  async function openFilingNotAllowedErrorModal() {
    await errorModal.open({
      error: undefined,
      i18nPrefix: 'modal.error.filing.notAllowed',
      buttons: [
        {
          label: t('label.goBack'),
          to: dashboardUrl.value,
          external: true,
          variant: 'outline'
        },
        { label: t('label.refreshPage'), onClick: () => window.location.reload() }
      ]
    })
  }

  async function openGetDraftFilingErrorModal(error: unknown) {
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.filing.getDraft',
      buttons: [
        {
          label: t('label.goBack'),
          to: dashboardUrl.value,
          variant: 'outline',
          external: true
        },
        { label: t('label.refreshPage'), onClick: () => window.location.reload() }
      ]
    })
  }

  /** The changes report failed to load - a resumed draft is never shown unchecked */
  async function openGetDraftChangesErrorModal(error: unknown) {
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.filing.getDraftChanges',
      buttons: [
        {
          label: t('label.goBack'),
          to: dashboardUrl.value,
          variant: 'outline',
          external: true
        },
        { label: t('label.refreshPage'), onClick: () => window.location.reload() }
      ]
    })
  }

  async function openInitFilingErrorModal(error: unknown) {
    const status = getErrorStatus(error)
    const isUnauthorizedOrBusinessNotFound = status && [401, 403, 404].includes(status)
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.filing.init',
      buttons: isUnauthorizedOrBusinessNotFound
        ? [
          {
            label: t('label.goToMyBusinessRegistry'),
            to: `${rtc.brdUrl}account/${accountStore.currentAccount.id}`,
            external: true
          }
        ]
        : [
          {
            label: t('label.goBack'),
            to: dashboardUrl.value,
            variant: 'outline',
            external: true
          },
          { label: t('label.refreshPage'), onClick: () => window.location.reload() }
        ]
    })
  }

  async function openFilingNotAvailableModal() {
    await baseModal.open({
      title: t('modal.error.filing.notAvailable.title'),
      description: t('modal.error.filing.notAvailable.description'),
      buttons: [
        {
          label: t('label.goBack'),
          to: dashboardUrl.value,
          external: true
        }
      ],
      dismissible: false
    })
  }

  return {
    openUnsavedChangesModal,
    openDraftStaleModal,
    openSaveFilingErrorModal,
    openFilingNotAllowedErrorModal,
    openGetDraftFilingErrorModal,
    openGetDraftChangesErrorModal,
    openInitFilingErrorModal,
    openFilingNotAvailableModal
  }
}
