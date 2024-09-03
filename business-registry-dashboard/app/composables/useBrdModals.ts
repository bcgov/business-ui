// https://ui.nuxt.com/components/modal#control-programmatically
import { ModalManageNameRequest, ModalBase, ModalRemoveBusiness } from '#components'

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
        title: 'Error Adding Existing Business', // TODO: add translations
        description: 'An error occurred adding your business. Please try again.'
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function openBusinessUnavailableError (action: string) { // TODO: add translations
    let description = 'You are not authorized to access the business'
    if (action === 'change name') {
      description += ' to change its name'
    } else {
      description += ' you wish to ' + action
    }
    description += '. Please add this business to your table to continue.'

    modal.open(ModalBase, {
      error: {
        title: 'Business Unavailable',
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

  function close () {
    modal.close()
  }

  return {
    openManageNameRequest,
    openManageNRError,
    openBusinessAddError,
    openBusinessUnavailableError,
    openBusinessRemovalConfirmation,
    close
  }
}
