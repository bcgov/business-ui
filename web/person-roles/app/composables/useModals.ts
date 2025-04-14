import { ModalOfficerInitializeError } from '#components'

export const useModals = () => {
  const overlay = useOverlay()

  async function openOfficerInitErrorModal(status: number | undefined) {
    const modal = overlay.create(ModalOfficerInitializeError, {
      props: {
        status
      }
    })

    await modal.open()
  }

  return {
    openOfficerInitErrorModal
  }
}
