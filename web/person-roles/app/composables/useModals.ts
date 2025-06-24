import type { ModalButtonProps } from '~/interfaces'
import {
  ModalBase,
  ModalOfficerInitializeError,
  ModalOfficerFilingNotAllowed
} from '#components'

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

  async function openOfficerFilingNotAllowedModal() {
    const modal = overlay.create(ModalOfficerFilingNotAllowed)

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
    openOfficerFilingNotAllowedModal,
    openBaseModal
  }
}
