// https://ui.nuxt.com/components/modal#control-programmatically
import { ModalManageNameRequest, ModalBase, ModalRemoveBusiness, ModalManageBusiness, ModalAuthEmailSent, ModalCoopContinuationIn } from '#components'

export const useBrdModals = () => {
  const modal = useModal()
  const { t } = useNuxtApp().$i18n
  const config = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()

  function openManageNameRequest (nr: { names: string[], nrNum: string }) {
    modal.open(ModalManageNameRequest, {
      nameRequest: nr
    })
  }

  function openManageNRError () {
    modal.open(ModalBase, {
      error: {
        title: t('form.manageNR.error.default.title'),
        description: t('form.manageNR.error.default.description')
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function openBusinessAddError () {
    modal.open(ModalBase, {
      error: {
        title: t('error.businessAdd.title'),
        description: t('error.businessAdd.description')
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function nameRequestActionError () {
    modal.open(ModalBase, {
      error: {
        title: t('error.nameRequestAction.title'),
        description: t('error.nameRequestAction.description'),
        showContactInfo: true
      },
      actions: [
        { label: t('btn.goBack'), variant: 'outline', handler: () => close() },
        { label: t('btn.refreshPage'), handler: () => window.location.reload() }
      ]
    })
  }

  function openMagicLinkModal (title: string, description: string, description2?: string) {
    modal.open(ModalBase, {
      error: {
        title,
        description,
        description2
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function openContinuationInCoopModal () {
    modal.open(ModalCoopContinuationIn)
  }

  function openInvalidFilingApplication (type: string) {
    modal.open(ModalBase, {
      error: {
        title: t('error.invalidFilingApplication.title', { type }),
        description: t('error.invalidFilingApplication.description', { type })
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function openNoSubscriptionModal () {
    const config = useRuntimeConfig().public
    const accountStore = useConnectAccountStore()

    modal.open(ModalBase, {
      error: {
        title: t('error.noSubscription.title'),
        description: t('error.noSubscription.description')
      },
      actions: [{
        label: t('btn.close'),
        handler: () => close()
      }],
      onModalClosed: () => {
        window.location.href = `${config.registryHomeURL}dashboard?accountid=${accountStore.currentAccount.id}`
      }
    } as any)
  }

  function openAdminAccountSetupIncomplete () {
    modal.open(ModalBase, {
      error: {
        title: t('error.adminAccountSetupIncomplete.title'),
        description: t('error.adminAccountSetupIncomplete.description')
      },
      actions: [
        { label: t('btn.close'), variant: 'outline', handler: () => close() },
        {
          label: t('btn.accountSetup'),
          handler: () => {
            window.location.href = `${config.authWebUrl}/account/${accountStore.currentAccount.id}/settings/account-info`
          }
        }
      ],
      onModalClosed: () => {
        window.location.href = `${config.registryHomeURL}dashboard?accountid=${accountStore.currentAccount.id}`
      }
    } as any)
  }

  function openNonAdminAccountSetupIncomplete () {
    modal.open(ModalBase, {
      error: {
        title: t('error.nonAdminAccountSetupIncomplete.title'),
        description: t('error.nonAdminAccountSetupIncomplete.description')
      },
      actions: [
        { label: t('btn.close'), variant: 'outline', handler: () => close() },
        {
          label: t('btn.accountSetup'),
          handler: () => {
            window.location.href = `${config.authWebUrl}/account/${accountStore.currentAccount.id}/settings/account-info`
          }
        }
      ],
      onModalClosed: () => {
        window.location.href = `${config.registryHomeURL}dashboard?accountid=${accountStore.currentAccount.id}`
      }
    } as any)
  }

  function openInvalidNameRequest () {
    modal.open(ModalBase, {
      error: {
        title: t('error.invalidNameRequest.title'),
        description: t('error.invalidNameRequest.description')
      },
      actions: [
        { label: t('btn.close'), variant: 'outline', handler: () => close() },
        { label: t('btn.refreshTable'), handler: () => { useAffiliationsStore().loadAffiliations(); close() } }
      ]
    })
  }

  function openBusinessUnavailableError (action: string) {
    let title: string
    let description: string
    if (action === 'change name') {
      title = t('error.businessUnavailable.changeName.title')
      description = t('error.businessUnavailable.changeName.description')
    } else {
      title = t('error.businessUnavailable.generic.title')
      description = t('error.businessUnavailable.generic.description', { action })
    }

    modal.open(ModalBase, {
      error: {
        title,
        description,
        showContactInfo: true
      },
      actions: [{ label: t('btn.ok'), handler: () => close() }]
    })
  }

  function openAccessRestricted () {
    modal.open(ModalBase, {
      error: {
        title: t('error.accessRestricted.title'),
        description: t('error.accessRestricted.description')
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function openBusinessRemovalConfirmation (removeBusinessPayload: RemoveBusinessPayload) {
    const type = removeBusinessPayload.business.corpType.code
    if (type === CorpTypes.COOP) {
      modal.open(ModalRemoveBusiness, { removeBusinessPayload, type: 'passcode' })
    } else {
      modal.open(ModalRemoveBusiness, { removeBusinessPayload, type: 'generic' })
    }
  }

  function openManageBusiness (business: ManageBusinessEvent) {
    modal.open(ModalManageBusiness, { business })
  }

  function openAuthEmailSent (email: string) {
    modal.open(ModalAuthEmailSent, { email })
  }

  function close () {
    modal.close()
  }

  return {
    openManageNameRequest,
    openManageNRError,
    openBusinessAddError,
    nameRequestActionError,
    openBusinessUnavailableError,
    openInvalidFilingApplication,
    openInvalidNameRequest,
    openBusinessRemovalConfirmation,
    openManageBusiness,
    openMagicLinkModal,
    openAuthEmailSent,
    openContinuationInCoopModal,
    openAccessRestricted,
    openNoSubscriptionModal,
    openAdminAccountSetupIncomplete,
    openNonAdminAccountSetupIncomplete,
    close
  }
}
