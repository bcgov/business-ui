<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  options: string[]
  placeholder: string
  disabled?: boolean
  label: string
  sectionBreakBefore?: string[] // <-- optional, list of items to place a break before
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const { t } = useNuxtApp().$i18n

const query = ref('')
const isOpen = ref(false)
const inputRef = ref<any>()

// Filter options based on prefix word matching
const filteredOptions = computed(() => {
  if (!query.value.trim()) {
    return props.options
  }

  const searchTerms = query.value.toLowerCase().trim().split(/\s+/)

  return props.options.filter((option) => {
    const optionWords = option.toLowerCase().split(/\s+/)

    // Every search term must match the start of some word in the option
    return searchTerms.every(searchTerm =>
      optionWords.some(word => word.startsWith(searchTerm))
    )
  })
})

// Display text for the trigger input
const displayText = computed(() => {
  // If dropdown is open and user is typing, don't show selection text
  if (isOpen.value && query.value.trim()) {
    return ''
  }

  if (props.modelValue.length === 0) {
    return props.placeholder
  } else if (props.modelValue.length === 1) {
    return props.modelValue[0]
  } else {
    return t('words.Multiple')
  }
})

// Handle option selection/deselection
function toggleOption (option: string) {
  const newValue = props.modelValue.includes(option)
    ? props.modelValue.filter(item => item !== option)
    : [...props.modelValue, option]

  emit('update:modelValue', newValue)
}

// Handle input changes
function handleInput (event: Event) {
  if (isOpen.value) {
    const target = event.target as HTMLInputElement
    query.value = target.value
  }
}

// Open dropdown
function openDropdown () {
  if (!props.disabled) {
    isOpen.value = true
    nextTick(() => {
      if (inputRef.value && inputRef.value.$el) {
        const input = inputRef.value.$el.querySelector('input')
        if (input) {
          input.focus()
        }
      }
    })
  }
}

// Close dropdown
function closeDropdown () {
  isOpen.value = false
  query.value = ''
}

// Handle click outside to close dropdown
const componentRef = ref<HTMLElement>()

onClickOutside(componentRef, () => {
  closeDropdown()
})
</script>

<template>
  <div ref="componentRef" class="relative">
    <!-- Combined Trigger/Search Input -->
    <div class="relative">
      <!-- When closed: display area with text wrapping -->
      <div
        v-if="!isOpen"
        class="flex h-[42px] w-full min-w-[200px] cursor-pointer items-center rounded-none rounded-t border-b border-gray-700 bg-gray-100 px-3 py-2 text-sm"
        :class="{
          'cursor-not-allowed opacity-75': disabled,
          'hover:bg-gray-200': !disabled,
          'text-gray-700': modelValue.length === 0,
          'text-gray-900': modelValue.length > 0
        }"
        :aria-label="label"
        @click="openDropdown"
      >
        <div class="w-full whitespace-normal break-words leading-tight">
          {{ displayText }}
        </div>
      </div>

      <!-- When open: search input -->
      <UInput
        v-else
        ref="inputRef"
        :model-value="query"
        :placeholder="displayText"
        :disabled="disabled"
        variant="bcGovSm"
        class="w-full min-w-[200px]"
        :aria-label="label"
        @input="handleInput"
        @focus="() => {}"
      />

      <UIcon
        name="i-mdi-caret-down"
        class="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-700 transition-transform duration-200"
        :class="[isOpen && 'rotate-180']"
      />
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-[999] mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
    >
      <!-- Options List -->
      <div class="py-1">
        <div
          v-for="option in filteredOptions"
          :key="option"
          data-testid="option"
        >
          <!--
            Render a horizontal divider line before this option if it's in the sectionBreakBefore list.
            This visually separates groups of options in the dropdown.
          -->
          <hr v-if="sectionBreakBefore?.includes(option)" class="w-full border-gray-300">
          <label
            class="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50"
            @click.prevent="toggleOption(option)"
          >
            <UCheckbox
              :model-value="modelValue.includes(option)"
              :aria-label="`Select ${option}`"
              class="pointer-events-none"
            />
            <span class="flex-1 text-sm">{{ option }}</span>
          </label>
        </div>

        <!-- No results message -->
        <div v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-gray-500">
          {{ t('AsyncComboBox.noResults') }}
        </div>
      </div>
    </div>
  </div>
</template>
