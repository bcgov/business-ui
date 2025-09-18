export const useOfficerModals = () => {
  const { baseModal, errorModal } = useModal()
  const t = useNuxtApp().$i18n.t
  const rtc = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const { dashboardUrl, dashboardOrEditUrl } = useOfficerNavigation()

  async function openUnsavedChangesModal(revokeBeforeUnloadEvent: () => void) {
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
            revokeBeforeUnloadEvent()
            await navigateTo(dashboardOrEditUrl.value, {
              external: true
            })
          }
        }
      ]
    })
  }

  async function openPendingTaskOnSaveOrSubmitModal() {
    await errorModal.open({
      error: undefined,
      i18nPrefix: 'modal.error.pendingTaskOnSaveOrSubmit'
    })
  }

  async function openSaveFilingErrorModal(error: unknown) {
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.submitFiling'
    })
  }

  async function openFilingNotAllowedErrorModal() {
    await errorModal.open({
      error: undefined,
      i18nPrefix: 'modal.error.filingNotAllowed',
      buttons: [
        {
          label: t('label.goBack'),
          to: dashboardOrEditUrl.value,
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
      i18nPrefix: 'modal.error.getDraftFiling',
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

  async function openInitOfficerStoreErrorModal(error: unknown) {
    const status = getErrorStatus(error)
    const isUnauthorizedOrBusinessNotFound = status && [401, 403, 404].includes(status)
    await errorModal.open({
      error,
      i18nPrefix: 'modal.error.initOfficerStore',
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
            to: dashboardOrEditUrl.value,
            variant: 'outline',
            external: true
          },
          { label: t('label.refreshPage'), onClick: () => window.location.reload() }
        ]
    })
  }

  async function openFilingNotAvailableModal() {
    await baseModal.open({
      title: t('modal.filingNotAvailable.title'),
      description: t('modal.filingNotAvailable.description'),
      buttons: [
        {
          label: t('label.goBack'),
          to: dashboardOrEditUrl.value,
          external: true
        }
      ],
      dismissible: false
    })
  }

  return {
    openUnsavedChangesModal,
    openPendingTaskOnSaveOrSubmitModal,
    openSaveFilingErrorModal,
    openFilingNotAllowedErrorModal,
    openGetDraftFilingErrorModal,
    openInitOfficerStoreErrorModal,
    openFilingNotAvailableModal
  }
}
