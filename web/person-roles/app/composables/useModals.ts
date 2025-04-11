import type { ButtonProps } from '@nuxt/ui'
import { ModalOfficerError } from '#components'

export const useModals = () => {
  const overlay = useOverlay()

  async function openOfficerInitErrorModal(title: string, description: string, buttons: ButtonProps[]) {
    const modal = overlay.create(ModalOfficerError, {
      props: {
        title,
        description,
        buttons
      }
    })

    await modal.open()
  }

  return {
    openOfficerInitErrorModal
  }
}
