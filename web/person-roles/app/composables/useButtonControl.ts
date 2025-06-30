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

  async function setAlertText(reset: boolean, grp?: 'left' | 'right', text?: string) {
    // clear existing text
    route.meta.buttonControl.leftAlertText = undefined
    route.meta.buttonControl.rightAlertText = undefined

    // only continue if not resetting
    if (!reset) {
      // required for dom to clear existing content
      // allows screenreader alert for the same content if set multiple times
      await nextTick()
      // set content
      route.meta.buttonControl.leftAlertText = (grp === 'left') ? text : undefined
      route.meta.buttonControl.rightAlertText = (grp === 'right') ? text : undefined
    }
  }

  return {
    getButtonControl,
    setButtonControl,
    handleButtonLoading,
    setAlertText
  }
}
