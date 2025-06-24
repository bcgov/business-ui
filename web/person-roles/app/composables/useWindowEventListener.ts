export const useWindowEventListener = <E extends keyof WindowEventMap>(
  event: E,
  callback: (event: WindowEventMap[E]) => void
) => {
  onMounted(() => window.addEventListener(event, callback))
  onUnmounted(() => window.removeEventListener(event, callback))

  function revoke() {
    window.removeEventListener(event, callback)
  }

  return {
    revoke
  }
}
