import type { ModalButtonProps } from '~/interfaces'
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

    return modal
  }

  async function openBaseErrorModal(status: number | undefined, i18nPrefix: string, buttons?: ModalButtonProps[]) {
    const modal = overlay.create(ModalBaseError, {
      props: {
        status,
        i18nPrefix,
        buttons
      }
    })

    await modal.open()

    return modal
  }

  return {
    openBaseModal,
    openBaseErrorModal
  }
}
