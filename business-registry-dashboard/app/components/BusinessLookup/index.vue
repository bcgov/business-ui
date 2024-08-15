<script setup lang="ts">
import { UInput } from '#components'

const inputRef = ref<InstanceType<typeof UInput> | null>(null)
const resultListItems = ref<NodeListOf<HTMLLIElement> | null>(null)

const { combo, keyupHandler, handleInput, emitSearchResult } = useComboBox(inputRef, resultListItems)

</script>
<template>
  <div>
    <UInput
      id="business-search-input"
      ref="inputRef"
      type="text"
      role="combobox"
      :value="combo.query"
      :aria-expanded="combo.showDropdown"
      aria-controls="search-results-container"
      autocomplete="off"
      aria-autocomplete="list"
      variant="bcGovLg"
      :loading="combo.loading"
      :placeholder="$t('page.home.busOrNRSearch.placeholder')"
      :ui="{
        base: 'bg-white',
        placeholder: 'placeholder-gray-400 placeholder:text-base',
        icon: {
          base: combo.hasFocus ? 'text-blue-500' : 'text-gray-600',
          size: { sm: 'size-6' }
        }
      }"
      icon="i-mdi-magnify"
      trailing
      @keyup="keyupHandler"
      @focus="combo.hasFocus = true"
      @blur="combo.hasFocus = false"
      @input="handleInput"
    />
    <div
      v-show="combo.showDropdown && combo.hasFocus"
      class="absolute z-[999] max-h-72 w-full overflow-auto rounded-b-md bg-white shadow-md"
    >
      <div
        v-if="combo.error"
        class="flex flex-col gap-2 px-4 py-2"
      >
        <span class="font-semibold">Error retrieving search results, please try again later.</span>
      </div>
      <div
        v-else-if="combo.results.length === 0"
        class="flex flex-col gap-2 px-4 py-2"
      >
        <span class="font-semibold">No active B.C. business found</span>
        <span>Ensure you have entered the correct business name or number.</span>
      </div>
      <ul
        v-else
        id="search-results-container"
        role="listbox"
        aria-label="Business Search Results"
      >
        <li
          v-for="item in combo.results"
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
    <span role="status" class="sr-only">
      {{ combo.statusText }}
    </span>
  </div>
</template>
