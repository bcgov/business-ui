import { UInput } from '#components'

export const useComboBox = (
  inputRef: Ref<InstanceType<typeof UInput> | null>,
  resultListItems: Ref<NodeListOf<HTMLLIElement> | null>
) => {
  const config = useRuntimeConfig().public
  const accountStore = useConnectAccountStore()
  const keycloak = useKeycloak()

  const combo = reactive<{
    query: string,
    loading: boolean,
    showDropdown: boolean,
    hasFocus: boolean,
    results: RegSearchResult[],
    statusText: string,
    error: boolean
  }>({
    query: '',
    loading: false,
    showDropdown: false,
    hasFocus: false,
    results: [],
    statusText: '',
    error: false
  })

  const fetchResults = async () => {
    try {
      if (combo.query.trim() === '') {
        combo.results = []
        return
      }

      combo.statusText = ''
      combo.error = false

      const token = await keycloak.getToken()
      const response = await $fetch<RegSearchResponse>(`${config.regSearchApiUrl}/search/businesses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-apikey': config.xApiKey,
          'Account-Id': accountStore.currentAccount.id
        },
        body: {
          query: {
            value: combo.query
          },
          categories: {
            status: ['ACTIVE'],
            legalType: ['A', 'BC', 'BEN', 'C', 'CBEN', 'CC', 'CCC', 'CP', 'CUL', 'FI', 'GP', 'LL', 'LLC', 'LP', 'PA', 'S', 'SP', 'ULC', 'XCP', 'XL', 'XP', 'XS']
          },
          rows: 20,
          start: 0
        }
      })

      if (response.searchResults.results.length) {
        combo.results = response.searchResults.results
        setTimeout(() => {
          combo.statusText = `${combo.results.length} results`
        }, 300)
      }
    } catch (e) {
      console.log('Error fetching search results:', e)
      combo.error = true
      setTimeout(() => {
        combo.statusText = 'Error retrieving search results'
      }, 300)
    } finally {
      combo.loading = false
    }
  }

  const debouncedFetchResults = useDebounceFn(fetchResults, 500)

  const getResults = () => {
    combo.loading = true
    debouncedFetchResults()
  }

  function setActiveElement (element: HTMLElement) {
    // reset all elements first
    resetActiveElement()
    // set active <li> element
    element.setAttribute('aria-selected', 'true')
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // set <input> active-descendant attr to correct <li> item
    inputRef.value.input.setAttribute('aria-activedescendant', element.id)
  }

  function resetActiveElement () {
    // remove aria-selected attr from all result <li>s
    resultListItems.value?.forEach((item) => {
      item.removeAttribute('aria-selected')
    })

    // remove aria-activedescendant attr from <input>
    inputRef.value.input.removeAttribute('aria-activedescendant')
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
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab']
    const key = e.code
    const activeElIndex = getActiveElementIndex() // get aria-activedescendant index or return -1
    const resultMax = combo.results.length - 1 // last <li> element index

    if (key === 'Tab') {
      combo.showDropdown = false
      resetActiveElement()
      combo.hasFocus = false
    }

    // // only continue if the <input> is focused and the dropdown is open
    if (combo.hasFocus && combo.showDropdown) {
      // remove aria-activedescendant and aria-active if user had an item selected but then keeps typing
      if (!allowedKeys.includes(key) && activeElIndex >= 0) {
        resetActiveElement()
        return
      }
      switch (key) {
        // handle arrowdown
        case 'ArrowDown': {
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
        case 'ArrowUp': {
          e.preventDefault()
          if (!resultListItems.value || resultListItems.value.length === 0) {
            return // return early if in error or no results state
          }
          const prevIndex = activeElIndex <= 0 ? resultMax : activeElIndex - 1
          const prevElement = resultListItems.value[prevIndex]
          if (prevElement) {
            setActiveElement(prevElement)
          }
          break
        }
        // handle enter
        case 'Enter':
          e.preventDefault()
          // do nothing if no active element
          if (activeElIndex >= 0 && combo.results[activeElIndex]) {
            emitSearchResult(combo.results[activeElIndex] as RegSearchResult)
          }
          break
        // handle escape, close dropdown, reset active element and search results
        case 'Escape':
          e.preventDefault()
          combo.showDropdown = false
          resetActiveElement()
          combo.results = []
          break

        default:
          break
      }
      // allow enter and escape keys if input is not empty, has focus and dropdown is closed
    } else if (
      combo.hasFocus &&
      !combo.showDropdown &&
      combo.query !== ''
    ) {
      switch (key) {
        // clear input field and reset search results
        case 'Escape':
          e.preventDefault()
          combo.query = ''
          resetActiveElement()
          combo.results = []
          break

        // rerun search and display results
        case 'Enter':
          e.preventDefault()
          resetActiveElement()
          combo.results = []
          combo.showDropdown = true
          getResults()
          break

        default:
          break
      }
    }
  }

  // select and dispatch event with selected item, cleanup ui
  function emitSearchResult (result: RegSearchResult) {
    console.log(inputRef.value.input)
    console.log('Selected Result:', result)

    combo.query = result.name
    combo.showDropdown = false
    resetActiveElement()
    combo.results = []

    setTimeout(() => {
      inputRef.value.input.focus()
    }, 0)
  }

  function handleInput (e: Event) {
    combo.query = (e.target as HTMLInputElement).value
    if (combo.query !== '') {
      getResults()
      combo.showDropdown = true
    } else {
      combo.showDropdown = false
    }
  }

  return {
    combo,
    getResults,
    keyupHandler,
    handleInput,
    emitSearchResult
  }
}
