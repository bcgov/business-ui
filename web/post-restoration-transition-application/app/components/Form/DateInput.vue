<script lang="ts" setup>
const model = defineModel<string | undefined>({ default: undefined })
const emit = defineEmits(['change'])

const {
  maxlength = '1000',
  readonly = false,
  focusOut = false
} = defineProps<{
  id: string
  label: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  maxlength?: string
  minDate?: string
  maxDate?: string
  readonly?: boolean
  focusOut?: boolean
}>()

// this is just to force hide the calendar as when this is first in a modal it opens the calendar by default
const firstFocus = ref(true)
const showDatePicker = ref(false)
const updateDate = (date: string) => {
  displayDate.value = fromIsoToUsDateFormat(date)?.toString() || ''
  model.value = date
  emit('change')
}
const handleUpdateDate = (date: Date) => {
  updateDate(date.toISOString())
  showDatePicker.value = false
  hasDateChanged.value = true
}
const hasDateChanged = ref(false)
const dateSelectPickerRef = ref<unknown>()
const selectedDate = ref('')
const changeDateHandler = () => {
  showDatePicker.value = false
  emit('change')
}

const displayDate = ref('')
const blurInputHandler = () => {
  if (!displayDate.value) {
    return
  }
  const tempDate = new Date(displayDate.value)
  // set to all dates to be in noon UTC to display correctly when showing current date in our timezone
  // and to avoid extensive calculation of PST vs PDT
  tempDate.setUTCHours(12, 0, 0, 0)
  updateDate(tempDate.toISOString())
}

const focusInHandler = () => {
  // avoid showing calendar if the prop is set (for modal use otherwise it auto opens immediately)
  if (firstFocus.value && focusOut) {
    firstFocus.value = false
    return
  }

  showDatePicker.value = true
  return !readonly
}
</script>

<template>
  <UInput
    v-model.trim="displayDate"
    :aria-required="required"
    :data-testid="id"
    :disabled
    :maxlength
    :readonly
    :ui="{
      base: invalid ? 'ring-0 shadow-bcGovInputError focus:shadow-bcGovInputError' : '',
      icon: {
        trailing: { pointer: '' }
      }
    }"
    class="w-full grow !rounded-md"
    placeholder=""
    @blur="blurInputHandler"
    @change="changeDateHandler"
    @focusin="focusInHandler"
  >
    <label
      :class="invalid ? 'text-red-600' : ''"
      :for="id"
      class="floating-label-input"
    >
      {{ label }}
    </label>
    <template #trailing>
      <UIcon
        class="text-2xl text-bcGovColor-midGray cursor-pointer"
        name="i-mdi-calendar"
        @click="showDatePicker = !showDatePicker"
      />
    </template>
  </UInput>
  <FormDatePicker
    v-if="showDatePicker"
    ref="dateSelectPickerRef"
    :default-selected-date="selectedDate || undefined"
    :set-max-date="maxDate"
    :set-min-date="minDate"
    class="absolute z-20"
    @selected-date="handleUpdateDate($event)"
  />
</template>
