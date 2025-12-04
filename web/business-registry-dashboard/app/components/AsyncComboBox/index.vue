<script setup lang="ts">
import { UInput } from '#components'
const { t } = useNuxtApp().$i18n

const props = defineProps<{
  searchFn:(query: string) => Promise<any[]>
  idAttr: string
  valueAttr: string
  text: {
    placeholder: string
    arialabel: string
  },
  disabledConfig?: {
    items: Array<any>,
    comparisonAttrs: Array<string>
  }
}>()

const emit = defineEmits<{select: [item: any]}>()

const inputRef = ref<InstanceType<typeof UInput> | null>(null)
const resultListItems = ref<HTMLLIElement[] | null>(null)
const query = ref('')
const loading = ref(false)
const showDropdown = ref(false)
const hasFocus = ref(false)
const searchResults = ref<any[]>([])
const statusText = ref('')
const hasError = ref(false)

// Helper function to reset dropdown states
function resetDropdown () {
  showDropdown.value = false
  resetActiveElement()
  searchResults.value = []
}

function isItemDisabled (item: any): boolean {
  const { items = [], comparisonAttrs = [] } = props.disabledConfig || {}

  if (!items.length || !comparisonAttrs.length) {
    return false
  }

  const itemIdValue = item[props.idAttr]

  return items.some((disabledItem) => {
    return comparisonAttrs.some(attr => disabledItem[attr] && disabledItem[attr] === itemIdValue)
  })
}

async function fetchResults () {
  try {
    if (query.value.trim() === '') { // return if query is empty
      resetDropdown()
      return
    }

    resultListItems.value = null
    statusText.value = ''
    hasError.value = false

    const response = await props.searchFn(query.value)

    if (response.length >= 0) {
      searchResults.value = response.map((item) => {
        const disabled = isItemDisabled(item)
        return { ...item, disabled }
      })

      const enabledResultsCount = searchResults.value.filter(item => !item.disabled).length
      setTimeout(() => {
        statusText.value = t('AsyncComboBox.resultsCount', { count: enabledResultsCount })
      }, 300) // delay so screen reader is updated correctly
    }
  } catch (e) {
    logFetchError(e, 'Error fetching search results')
    hasError.value = true
    setTimeout(() => {
      statusText.value = t('AsyncComboBox.error')
    }, 300) // delay so screen reader is updated correctly
  } finally {
    loading.value = false
  }
}

const debouncedFetchResults = useDebounceFn(fetchResults, 500)

function getResults () {
  loading.value = true
  searchResults.value = []
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
    // return active index
    return resultListItems.value.findIndex(
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
  const resultMax = searchResults.value.length - 1 // last <li> element index

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
        if (!resultListItems.value || resultListItems.value?.length === 0) { return } // return early if no results

        // return early if all items are disabled
        const allItemsDisabled = searchResults.value.every(item => item.disabled)
        if (allItemsDisabled) {
          return
        }

        let nextIndex = activeElIndex === -1 || activeElIndex === resultMax ? 0 : activeElIndex + 1

        // skip disabled items while moving down
        while (searchResults.value[nextIndex]?.disabled && nextIndex < resultMax) {
          nextIndex++
        }

        // if last item disabled, wrap to first item
        if (searchResults.value[nextIndex]?.disabled && nextIndex === resultMax) {
          nextIndex = 0
          while (searchResults.value[nextIndex]?.disabled && nextIndex < resultMax) {
            nextIndex++ // skip disabled items while moving down again
          }
        }

        // set active element if found
        const nextElement = resultListItems.value[nextIndex]
        if (nextElement && !searchResults.value[nextIndex]?.disabled) {
          setActiveElement(nextElement)
        }
        break
      }
      // handle arrow up
      case KeyCode.ARROWUP: {
        e.preventDefault()
        if (!resultListItems.value || resultListItems.value.length === 0) { return } // return early if in error or no results state

        // return early if all items are disabled
        const allItemsDisabled = searchResults.value.every(item => item.disabled)
        if (allItemsDisabled) {
          return
        }

        let prevIndex = activeElIndex <= 0 ? resultMax : activeElIndex - 1

        // skip disabled items while moving up
        while (searchResults.value[prevIndex]?.disabled && prevIndex > 0) {
          prevIndex--
        }

        // if first item is disabled, wrap to last item
        if (searchResults.value[prevIndex]?.disabled && prevIndex === 0) {
          prevIndex = resultMax
          while (searchResults.value[prevIndex]?.disabled && prevIndex > 0) {
            prevIndex-- // skip disabled items while moving up again
          }
        }

        // set active element if found
        const prevElement = resultListItems.value[prevIndex]
        if (prevElement && !searchResults.value[prevIndex]?.disabled) {
          setActiveElement(prevElement)
        }
        break
      }
      // handle enter
      case KeyCode.ENTER:
        e.preventDefault()
        // emit if active element found and its not disabled
        if (activeElIndex >= 0 && searchResults.value[activeElIndex] && !searchResults.value[activeElIndex].disabled) {
          emitSearchResult(searchResults.value[activeElIndex])
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
        searchResults.value = []
        break

        // rerun search and display results
      case KeyCode.ENTER:
        e.preventDefault()
        resetActiveElement()
        searchResults.value = []
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
  query.value = result[props.valueAttr]
  resetDropdown()

  setTimeout(() => { // timeout required to wait for dom before applying focus, nextTick not working
    inputRef.value?.input.focus()
  }, 0)

  emit('select', result)
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
</script>
<template>
  <div>
    <UInput
      id="business-search-input"
      ref="inputRef"
      v-model="query"
      type="text"
      role="combobox"
      :aria-expanded="showDropdown"
      aria-controls="search-results-container"
      autocomplete="off"
      aria-autocomplete="list"
      variant="bcGovLg"
      :loading="loading"
      :placeholder="text.placeholder"
      :aria-label="text.arialabel"
      :ui="{
        base: 'bg-white',
        placeholder: 'placeholder-gray-400 placeholder:text-base',
        icon: {
          base: hasFocus ? 'text-blue-500' : 'text-gray-600',
          size: { sm: 'size-6' }
        },
        padding: {
          sm: 'pl-4 pr-2.5'
        }
      }"
      icon="i-mdi-magnify"
      trailing
      @keyup="keyupHandler"
      @focus="hasFocus = true"
      @blur="hasFocus = false"
      @input="handleInput"
    />
    <div
      v-show="showDropdown && hasFocus && !loading"
      data-testid="asynccombobox-dropdown-container"
      class="absolute z-[999] max-h-72 w-full overflow-auto rounded-b-md bg-white shadow-md"
    >
      <div v-if="hasError">
        <slot name="error">
          <div class="p-4">
            <span class="font-semibold">{{ $t('AsyncComboBox.error') }}</span>
          </div>
        </slot>
      </div>
      <div v-else-if="searchResults.length === 0">
        <slot name="empty">
          <div class="p-4">
            <span class="font-semibold">{{ $t('AsyncComboBox.noResults') }}</span>
          </div>
        </slot>
      </div>
      <ul
        v-else
        id="search-results-container"
        role="listbox"
        :aria-label="$t('AsyncComboBox.resultListLabel')"
      >
        <li
          v-for="item in searchResults"
          :id="item[idAttr]"
          ref="resultListItems"
          :key="item[idAttr]"
          role="option"
          aria-selected="false"
          :aria-disabled="item.disabled"
          class="p-4 transition-colors ease-linear aria-selected:bg-[#e4edf7]"
          :class="{
            'cursor-not-allowed': item.disabled,
            'cursor-pointer hover:bg-[#e4edf7]': !item.disabled
          }"
          @mousedown.prevent.stop="!item.disabled && emitSearchResult(item)"
        >
          <slot name="item" :item>
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1">
                <span>{{ item[valueAttr] }}</span>
              </div>
              <div v-if="!item.disabled" class="flex-1 text-right">
                <span class="text-sm text-blue-500">{{ $t('words.select') }}</span>
              </div>
              <div v-else class="flex-1 text-right">
                <span class="text-sm text-green-500">{{ $t('words.Added') }}</span>
              </div>
            </div>
          </slot>
        </li>
      </ul>
    </div>
    <span
      v-if="query !== ''"
      role="status"
      class="sr-only"
    >
      {{ statusText }}
    </span>
  </div>
</template>
