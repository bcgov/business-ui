import { UInput } from '#components'

export const useComboBox = (
  inputRef: Ref<InstanceType<typeof UInput> | null>,
  resultListItems: Ref<NodeListOf<HTMLLIElement> | null>,
  searchFn: (query: string) => Promise<any[]>,
  onSelect: (item: any) => void,
  valueAttr: string
) => {
  const { t } = useI18n()

  const query = ref('')
  const loading = ref(false)
  const showDropdown = ref(false)
  const hasFocus = ref(false)
  const results = ref<any[]>([])
  const statusText = ref('')
  const error = ref(false)

  // Helper function to reset dropdown states
  function resetDropdown () {
    showDropdown.value = false
    resetActiveElement()
    results.value = []
  }

  const fetchResults = async () => {
    try {
      if (query.value.trim() === '') { // return if query is empty
        resetDropdown()
        return
      }

      statusText.value = ''
      error.value = false

      const response = await searchFn(query.value)

      if (response.length >= 0) {
        results.value = response
        setTimeout(() => {
          statusText.value = t('AsyncComboBox.resultsCount', { count: results.value.length })
        }, 300) // delay so screen reader is updated correctly
      }
    } catch (e) {
      logFetchError(e, 'Error fetching search results')
      error.value = true
      setTimeout(() => {
        statusText.value = t('AsyncComboBox.error')
      }, 300) // delay so screen reader is updated correctly
    } finally {
      loading.value = false
    }
  }

  const debouncedFetchResults = useDebounceFn(fetchResults, 500)

  const getResults = () => {
    loading.value = true
    results.value = []
    debouncedFetchResults()
  }

  function setActiveElement (element: HTMLElement) {
    // reset all elements first
    resetActiveElement()
    // set active <li> element
    element.setAttribute('aria-selected', 'true')
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // set <input> active-descendant attr to correct <li> item
    inputRef.value?.input.setAttribute('aria-activedescendant', element.id)
  }

  function resetActiveElement () {
    // remove aria-selected attr from all result <li>s
    resultListItems.value?.forEach((item) => {
      item.removeAttribute('aria-selected')
    })

    // remove aria-activedescendant attr from <input>
    inputRef.value?.input.removeAttribute('aria-activedescendant')
  }

  // find active <li> index in search results list
  function getActiveElementIndex () {
    if (resultListItems.value) {
      // convert nodelist into array
      const resultArray = Array.from(resultListItems.value)

      // return active index
      return resultArray.findIndex(
        el => el.getAttribute('aria-selected') === 'true'
      )
    } else {
      return -1
    }
  }

  function keyupHandler (e: KeyboardEvent) {
    const allowedKeys = [KeyCode.ARROWUP, KeyCode.ARROWDOWN, KeyCode.ENTER, KeyCode.ESCAPE, KeyCode.TAB]
    const key = e.code as KeyCode
    const activeElIndex = getActiveElementIndex() // get aria-activedescendant index or return -1
    const resultMax = results.value.length - 1 // last <li> element index

    if (key === KeyCode.TAB) {
      resetDropdown()
    }

    // only continue if the <input> is focused and the dropdown is open
    if (hasFocus.value && showDropdown.value) {
      // remove aria-activedescendant and aria-active if user had an item selected but then keeps typing
      if (!allowedKeys.includes(key) && activeElIndex >= 0) {
        resetActiveElement()
        return
      }
      switch (key) {
        // handle arrowdown
        case KeyCode.ARROWDOWN: {
          e.preventDefault()
          if (!resultListItems.value || resultListItems.value?.length === 0) { return } // return early if in error or no results state
          // set focus to first <li> if no currently active <li> or if event fired from last <li>, else add 1
          const nextIndex = activeElIndex === -1 || activeElIndex === resultMax ? 0 : activeElIndex + 1
          const nextElement = resultListItems.value[nextIndex]
          if (nextElement) {
            setActiveElement(nextElement)
          }
          break
        }
        // handle arrow up
        case KeyCode.ARROWUP: {
          e.preventDefault()
          if (!resultListItems.value || resultListItems.value.length === 0) { return } // return early if in error or no results state
          const prevIndex = activeElIndex <= 0 ? resultMax : activeElIndex - 1
          const prevElement = resultListItems.value[prevIndex]
          if (prevElement) {
            setActiveElement(prevElement)
          }
          break
        }
        // handle enter
        case KeyCode.ENTER:
          e.preventDefault()
          // do nothing if no active element
          if (activeElIndex >= 0 && results.value[activeElIndex]) {
            emitSearchResult(results.value[activeElIndex] as RegSearchResult)
          }
          break
        // handle escape, close dropdown, reset active element and search results
        case KeyCode.ESCAPE:
          e.preventDefault()
          resetDropdown()
          break

        default:
          break
      }
      // allow enter and escape keys if input is not empty, has focus and dropdown is closed
    } else if (
      hasFocus.value &&
      !showDropdown.value &&
      query.value !== ''
    ) {
      switch (key) {
        // clear input field and reset search results
        case KeyCode.ESCAPE:
          e.preventDefault()
          query.value = ''
          resetActiveElement()
          results.value = []
          break

        // rerun search and display results
        case KeyCode.ENTER:
          e.preventDefault()
          resetActiveElement()
          results.value = []
          showDropdown.value = true
          getResults()
          break

        default:
          break
      }
    }
  }

  // select and dispatch event with selected item, cleanup ui
  function emitSearchResult (result: any) {
    query.value = result[valueAttr]
    resetDropdown()

    setTimeout(() => { // timeout required to wait for dom before applying focus, nextTick not working
      inputRef.value?.input.focus()
    }, 0)

    onSelect(result) // emit event
  }

  function handleInput (e: Event) {
    query.value = (e.target as HTMLInputElement).value
    if (query.value !== '') {
      getResults()
      showDropdown.value = true
    } else {
      resetDropdown()
    }
  }

  return {
    query,
    loading,
    showDropdown,
    hasFocus,
    results,
    statusText,
    error,
    getResults,
    keyupHandler,
    handleInput,
    emitSearchResult
  }
}
