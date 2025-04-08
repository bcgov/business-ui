import type { ButtonProps } from '@nuxt/ui'
import type { ConnectBtnControl } from '#imports'

export const useButtonControl = () => {
  const route = useRoute()

  function setButtonControl(buttonControl: ConnectBtnControl) {
    route.meta.buttonControl = buttonControl
  }

  function getButtonControl(): ConnectBtnControl {
    return route.meta.buttonControl as ConnectBtnControl
  }

  function handleButtonLoading(reset: boolean, buttonGrp?: 'left' | 'right', buttonIndex?: number) {
    // set button control for loading / disabling buttons on submit or save or reset to default
    const updateButtonGrp = (buttonArray: ButtonProps[], grp: 'left' | 'right') => {
      for (const [index, element] of buttonArray.entries()) {
        if (reset) {
          element.disabled = false
          element.loading = false
        } else {
          element.loading = (grp === buttonGrp) && index === buttonIndex
          element.disabled = !element.loading
        }
      }
    }
    const buttonControl = getButtonControl()
    // update left buttons with loading / disabled as required
    updateButtonGrp(buttonControl.leftButtons, 'left')
    // update right buttons with loading / disabled as required
    updateButtonGrp(buttonControl.rightButtons, 'right')
  }

  return {
    getButtonControl,
    setButtonControl,
    handleButtonLoading
  }
}
