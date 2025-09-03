import {
  ModalError
} from '#components'

export const useModal = () => {
  const overlay = useOverlay()

  const errorModal = overlay.create(ModalError)

  return {
    ...useConnectModal(),
    errorModal
  }
}
