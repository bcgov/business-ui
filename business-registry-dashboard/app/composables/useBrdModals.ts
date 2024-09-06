// https://ui.nuxt.com/components/modal#control-programmatically
import { ModalManageNameRequest, ModalBase, ModalRemoveBusiness, ModalManageBusiness } from '#components'

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
    if ([CorpTypes.NAME_REQUEST,
      CorpTypes.INCORPORATION_APPLICATION,
      CorpTypes.AMALGAMATION_APPLICATION,
      CorpTypes.REGISTRATION,
      CorpTypes.PARTNERSHIP,
      CorpTypes.SOLE_PROP].includes(type)) {
      modal.open(ModalRemoveBusiness, { removeBusinessPayload, type: 'generic' })
    } else {
      modal.open(ModalRemoveBusiness, { removeBusinessPayload, type: 'passcode' })
    }
  }

  function openManageBusiness (business: ManageBusinessEvent) {
    modal.open(ModalManageBusiness, { business })
  }

  function close () {
    modal.close()
  }

  return {
    openManageNameRequest,
    openManageNRError,
    openBusinessAddError,
    openBusinessUnavailableError,
    openBusinessRemovalConfirmation,
    openManageBusiness,
    close
  }
}
