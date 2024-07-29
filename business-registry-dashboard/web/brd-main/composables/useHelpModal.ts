const isOpen = ref(false)
export const useHelpModal = () => {
  function open () {
    isOpen.value = true
  }

  function close () {
    isOpen.value = false
  }

  return {
    open,
    close,
    isOpen
  }
}
