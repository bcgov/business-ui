import { ModalManageNameRequest } from '#components'

export const useBrdModals = () => {
  function manageNameRequest (open: boolean, nr?: { names: string[], nrNum: string }) {
    const modal = useModal()
    if (open && nr) {
      modal.open(ModalManageNameRequest, {
        nameRequest: nr
      })
    } else {
      modal.close()
    }
  }

  return {
    manageNameRequest
  }
}
