import {
  ModalError,
  ModalStaffPay
} from '#components'

export const useModal = () => {
  const overlay = useOverlay()

  const errorModal = overlay.create(ModalError)
  const staffPaymentModal = overlay.create(ModalStaffPay)

  return {
    ...useConnectModal(),
    errorModal,
    staffPaymentModal
  }
}
