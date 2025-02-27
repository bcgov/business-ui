// https://ui.nuxt.com/components/modal#control-programmatically
import { ModalManageNameRequest, ModalBase, ModalRemoveBusiness, ModalManageBusiness, ModalAuthEmailSent } from '#components'

export const useBrdModals = () => {
  const modal = useModal()
  const { t } = useI18n()

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

  function openInvalidContinuationApplication () {
    modal.open(ModalBase, {
      error: {
        title: t('error.invalidContinuationApplication.title'),
        description: t('error.invalidContinuationApplication.description')
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
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
    openBusinessUnavailableError,
    openInvalidContinuationApplication,
    openBusinessRemovalConfirmation,
    openManageBusiness,
    openMagicLinkModal,
    openAuthEmailSent,
    close
  }
}
