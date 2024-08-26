// https://ui.nuxt.com/components/modal#control-programmatically
import { ModalManageNameRequest, ModalBase } from '#components'

export const useBrdModals = () => {
  const modal = useModal()
  const { t } = useI18n()

  function manageNameRequest (nr: { names: string[], nrNum: string }) {
    modal.open(ModalManageNameRequest, {
      nameRequest: nr
    })
  }

  function manageNRError () {
    modal.open(ModalBase, {
      error: {
        title: t('form.manageNR.error.default.title'),
        description: t('form.manageNR.error.default.description')
      },
      actions: [{ label: t('btn.close'), handler: () => close() }]
    })
  }

  function close () {
    modal.close()
  }

  return {
    manageNameRequest,
    manageNRError,
    close
  }
}
