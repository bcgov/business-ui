import type { ModalButtonProps } from '~/interfaces'
import {
  ModalBase,
  ModalOfficerInitializeError,
  ModalOfficerFilingNotAllowed,
  ModalOfficerSubmitError
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

  async function openOfficerSubmitErrorModal(status: number | undefined) {
    const modal = overlay.create(ModalOfficerSubmitError, {
      props: {
        status,
        i18nPrefix: 'error.submitFiling'
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
    openOfficerFilingNotAllowedModal,
    openOfficerSubmitErrorModal,
    openBaseModal
  }
}
