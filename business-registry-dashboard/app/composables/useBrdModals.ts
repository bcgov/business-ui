// https://ui.nuxt.com/components/modal#control-programmatically
import { ModalManageNameRequest } from '#components'

export const useBrdModals = () => {
  const modal = useModal()

  function manageNameRequest (nr: { names: string[], nrNum: string }) {
    modal.open(ModalManageNameRequest, {
      nameRequest: nr
    })
  }

  function close () {
    modal.close()
  }

  return {
    manageNameRequest,
    close
  }
}
