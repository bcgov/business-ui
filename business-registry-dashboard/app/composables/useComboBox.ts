import { UInput } from '#components'

export const useComboBox = (
  inputRef: Ref<InstanceType<typeof UInput> | null>,
  resultListItems: Ref<NodeListOf<HTMLLIElement> | null>,
  searchResults: Ref<any[]>
) => {
  const comboValues = reactive({
    query: '',
    showDropdown: false,
    hasFocus: false
  })

  // set combobox aria values
  function setActiveElement (element: HTMLElement) {
    resetActiveElement()
    element.setAttribute('aria-selected', 'true')
    inputRef.value?.input.setAttribute('aria-activedescendant', element.id)
  }

  function resetActiveElement () {
    resultListItems.value?.forEach((item) => {
      item.removeAttribute('aria-selected')
    })
    inputRef.value?.input.removeAttribute('aria-activedescendant')
  }

  function getActiveElementIndex (): number {
    if (resultListItems.value) {
      const resultArray = Array.from(resultListItems.value)
      return resultArray.findIndex(el => el.getAttribute('aria-selected') === 'true')
    } else {
      return -1
    }
  }

  function keyupHandler (e: KeyboardEvent) {
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab']
    const key = e.code
    const activeElIndex = getActiveElementIndex()
    const resultMax = searchResults.value.length - 1

    if (key === 'Tab') {
      comboValues.showDropdown = false
      resetActiveElement()
      comboValues.hasFocus = false
    }

    if (comboValues.hasFocus && comboValues.showDropdown) {
      if (!allowedKeys.includes(key) && activeElIndex >= 0) {
        resetActiveElement()
        return
      }
      switch (key) {
        case 'ArrowDown':
          e.preventDefault()
          if (resultListItems.value?.length === 0) { return }
          if (activeElIndex === -1 || activeElIndex === resultMax) {
            setActiveElement(resultListItems.value[0])
          } else {
            setActiveElement(resultListItems.value[activeElIndex + 1])
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (resultListItems.value?.length === 0) { return }
          if (activeElIndex <= 0) {
            setActiveElement(resultListItems.value[resultMax])
          } else {
            setActiveElement(resultListItems.value[activeElIndex - 1])
          }
          break
        case 'Enter':
          e.preventDefault()
          if (activeElIndex >= 0) {
            console.log('enter key pressed, active element: ', searchResults.value[activeElIndex])
            // Your callback logic here
          }
          break
        case 'Escape':
          e.preventDefault()
          comboValues.showDropdown = false
          resetActiveElement()
          searchResults.value = []
          break
        default:
          break
      }
    } else if (comboValues.hasFocus && !comboValues.showDropdown && comboValues.query !== '') {
      switch (key) {
        case 'Escape':
          e.preventDefault()
          comboValues.query = ''
          resetActiveElement()
          searchResults.value = []
          break
        case 'Enter':
          e.preventDefault()
          resetActiveElement()
          searchResults.value = []
          comboValues.showDropdown = true
          console.log('re run search results')
          // Your search logic here
          break
        default:
          break
      }
    }
  }

  return {
    setActiveElement,
    resetActiveElement,
    getActiveElementIndex,
    keyupHandler,
    comboValues
  }
}
