<script setup lang="ts">
import { UInput } from '#components'

const props = defineProps<{
  searchFn:(query: string) => Promise<any[]>
  idAttr: string
  valueAttr: string
  text: {
    placeholder: string
    arialabel: string
  }
}>()

const emit = defineEmits<{select: [item: any]}>()

const inputRef = ref<InstanceType<typeof UInput> | null>(null)
const resultListItems = ref<NodeListOf<HTMLLIElement> | null>(null)

const combo = reactive(
  useComboBox(
    inputRef,
    resultListItems,
    props.searchFn,
    (item: any) => emit('select', item),
    props.valueAttr
  )
)
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
      :placeholder="text.placeholder"
      :aria-label="text.arialabel"
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
      @keyup="combo.keyupHandler"
      @focus="combo.hasFocus = true"
      @blur="combo.hasFocus = false"
      @input="combo.handleInput"
    />
    <div
      v-show="combo.showDropdown && combo.hasFocus && !combo.loading"
      class="absolute z-[999] max-h-72 w-full overflow-auto rounded-b-md bg-white shadow-md"
    >
      <div v-if="combo.error">
        <slot name="error">
          <div class="p-4">
            <span class="font-semibold">{{ $t('AsyncComboBox.error') }}</span>
          </div>
        </slot>
      </div>
      <div v-else-if="combo.results.length === 0">
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
          v-for="item in combo.results"
          :id="item[idAttr]"
          ref="resultListItems"
          :key="item[idAttr]"
          role="option"
          aria-selected="false"
          class="cursor-pointer p-4 transition-colors ease-linear hover:bg-[#e4edf7] aria-selected:bg-[#e4edf7]"
          @mousedown="combo.emitSearchResult(item)"
        >
          <slot name="item" :item>
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1">
                <span>{{ item[valueAttr] }}</span>
              </div>
              <div class="flex-1 text-right">
                <span class="text-sm text-blue-500">{{ $t('words.select') }}</span>
              </div>
            </div>
          </slot>
        </li>
      </ul>
    </div>
    <span
      v-if="combo.query !== ''"
      role="status"
      class="sr-only"
    >
      {{ combo.statusText }}
    </span>
  </div>
</template>
