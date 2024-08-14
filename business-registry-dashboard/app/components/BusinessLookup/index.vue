<script setup lang="ts">
import { UInput } from '#components'
const config = useRuntimeConfig().public
const accountStore = useConnectAccountStore()

const inputRef = ref<InstanceType<typeof UInput> | null>(null)
const resultListItems = ref<NodeListOf<HTMLLIElement> | null>(null)
const showDropdown = ref(false) // TODO: implement
const query = ref('')
const hasFocus = ref(false)
watch(query, (newVal) => {
  showDropdown.value = newVal.length > 0
})

// const { } = useComboBox()
// https://auth-api-test.apps.silver.devops.gov.bc.ca/
// return $fetch('https://bcregistry-sandbox.apigee.net/registry-search/api/v1/businesses/search/facets?start=0&rows=20&categories=legalType:A,BC,BEN,C,CBEN,CC,CCC,CP,CUL,FI,GP,LL,LLC,LP,PA,S,SP,ULC,XCP,XL,XP,XS&query=value:test', {
const { data: searchResults, status, error, clear: clearResults } = await useAsyncData(
  'fetch-businesses-or-name-requests',
  useDebounceFn(() => {
    if (query.value.trim() === '') {
      return Promise.resolve({ searchResults: { results: [] } } as unknown as RegSearchResponse)
    }
    const token = useNuxtApp().$keycloak.token
    return $fetch<RegSearchResponse>(`${config.regSearchApiUrl}/search/businesses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-apikey': config.xApiKey,
        'Account-Id': accountStore.currentAccount.id
      },
      body: {
        query: {
          value: query.value
        // name?: string
        // identifier?: string
        // bn?: string
        // parties?: { partyName: string }
        },
        categories: {
          status: ['ACTIVE', 'HISTORICAL', 'LIQUIDATION'],
          legalType: ['A', 'BC', 'BEN', 'C', 'CBEN', 'CC', 'CCC', 'CP', 'CUL', 'FI', 'GP', 'LL', 'LLC', 'LP', 'PA', 'S', 'SP', 'ULC', 'XCP', 'XL', 'XP', 'XS']
        },
        rows: 20,
        start: 0
      }
    })
  }, 500),
  {
    server: false,
    immediate: false,
    watch: [query],
    default: () => [],
    transform: (data: RegSearchResponse) => data.searchResults.results
  }
)

// set combobox aria values
function setActiveElement (element: HTMLElement) {
  // reset all elements first
  resetActiveElement()
  // set active <li> element
  element.setAttribute('aria-selected', 'true')

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
  const resultMax = searchResults.value.length - 1 // last <li> element index

  if (key === 'Tab') {
    showDropdown.value = false
    resetActiveElement()
    hasFocus.value = false
  }

  // // only continue if the <input> is focused and the dropdown is open
  if (hasFocus.value && showDropdown.value) {
    // remove aria-activedescendant and aria-active if user had an item selected but then keeps typing
    if (!allowedKeys.includes(key) && activeElIndex >= 0) {
      resetActiveElement()
      return
    }
    switch (key) {
      // handle arrowdown
      case 'ArrowDown':
        e.preventDefault()
        if (resultListItems.value?.length === 0) { return } // return early if in error or no results state
        // set focus to first <li> if no currently active <li> or if event fired from last <li>
        if (activeElIndex === -1 || activeElIndex === resultMax) {
          setActiveElement(resultListItems.value[0])
          // else move focus down the list 1
        } else {
          setActiveElement(resultListItems.value[activeElIndex + 1])
        }
        break
      // handle arrow up
      case 'ArrowUp':
        e.preventDefault()
        if (resultListItems.value?.length === 0) { return } // return early if in error or no results state
        // set focus to last <li> if no currently active <li> or if event fired from first <li>
        if (activeElIndex <= 0) {
          setActiveElement(resultListItems.value[resultMax])
          // else move up the list 1
        } else {
          setActiveElement(resultListItems.value[activeElIndex - 1])
        }
        break
      // handle enter
      case 'Enter':
        e.preventDefault()
        // do nothing if no active element
        if (activeElIndex >= 0) {
          emitSearchResult(searchResults.value[activeElIndex])
        }
        break
      // handle escape, close dropdown, reset active element and search results
      case 'Escape':
        e.preventDefault()
        showDropdown.value = false
        resetActiveElement()
        clearResults()
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
      case 'Escape':
        e.preventDefault()
        query.value = ''
        resetActiveElement()
        clearResults()
        break

      // rerun search and display results
      case 'Enter':
        e.preventDefault()
        resetActiveElement()
        clearResults()
        showDropdown.value = true
        console.log('re run search results')
        // this._searchTask.run() // TODO: implememtn something similar
        break

      default:
        break
    }
  }
}

// select and dispatch event with selected item, cleanup ui
function emitSearchResult (result: RegSearchResult) {
  console.log('Selected Result:', result)

  query.value = result.name
  showDropdown.value = false
  resetActiveElement()
  clearResults()
  inputRef.value.input.focus()
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
      :loading="status === 'pending'"
      :placeholder="$t('page.home.busOrNRSearch.placeholder')"
      :ui="{
        base: 'bg-white',
        placeholder: 'placeholder-gray-400 placeholder:text-base',
        icon: {
          base: hasFocus ? 'text-blue-500' : 'text-gray-600',
          size: { sm: 'size-6' }
        }
      }"
      icon="i-mdi-magnify"
      trailing
      @focus="hasFocus = true"
      @blur="hasFocus = false"
      @keyup="keyupHandler"
    />
    <div
      v-show="showDropdown && hasFocus"
      class="absolute z-[999] max-h-72 w-full overflow-auto rounded-b-md bg-white shadow-md"
    >
      <ul
        id="search-results-container"
        role="listbox"
        aria-label="Business Search Results"
        class=""
      >
        <!-- TODO: add aria-selected, add click handler -->
        <li
          v-for="item in searchResults"
          :id="item.identifier"
          ref="resultListItems"
          :key="item.identifier"
          role="option"
          aria-selected="false"
          class="cursor-pointer p-4 transition-colors ease-linear hover:bg-[#e4edf7] aria-selected:bg-[#e4edf7]"
          @mousedown="emitSearchResult(item)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <span>{{ item.identifier }}</span>
            </div>
            <div class="flex-1 px-2">
              <span>{{ item.name }}</span>
            </div>
            <div class="flex-1 text-right">
              <span class="text-sm text-blue-500">Select</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
