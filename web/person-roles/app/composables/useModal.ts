import {
  ModalBase,
  ModalBaseError
} from '#components'

export const useModal = () => {
  const overlay = useOverlay()

  async function openBaseModal(title: string, description: string, dismissible: boolean, buttons: ModalButtonProps[]) {
    const modal = overlay.create(ModalBase, {
      props: {
        title,
        description,
        dismissible,
        buttons
      }
    })

    await modal.open()
  }

  async function openBaseErrorModal(error: unknown, i18nPrefix: string, buttons?: ModalButtonProps[]) {
    const modal = overlay.create(ModalBaseError, {
      props: {
        error,
        i18nPrefix,
        buttons
      }
    })

    await modal.open()
  }

  return {
    openBaseModal,
    openBaseErrorModal
  }
}
