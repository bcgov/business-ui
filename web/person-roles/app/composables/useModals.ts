import type { ModalButtonProps } from '~/interfaces'
import { ModalOfficerInitializeError, ModalBase } from '#components'

export const useModal = () => {
  const overlay = useOverlay()

  async function openOfficerInitErrorModal(status: number | undefined) {
    const modal = overlay.create(ModalOfficerInitializeError, {
      props: {
        status
      }
    })

    await modal.open()
  }

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

  return {
    openOfficerInitErrorModal,
    openBaseModal
  }
}
