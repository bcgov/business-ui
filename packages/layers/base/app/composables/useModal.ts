import {
  ModalStaffPay
} from '#components'

export const useModal = () => {
  const overlay = useOverlay()

  const staffPaymentModal = overlay.create(ModalStaffPay)

  return {
    ...useConnectModal(),
    staffPaymentModal
  }
}
