<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const {
  maxlength = '1000'
} = defineProps<{
  id: string
  label: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  maxlength?: string
  minDate?: string
  maxDate?: string
}>()

const showDatePicker = ref(false)
const updateDate = (date: string) => {
  displayDate.value = fromIsoToUsDateFormat(date) || ''
  model.value = date
}
const hasDateChanged = ref(false)
const dateSelectPickerRef = ref<unknown>()
const selectedDate = ref('')
const changeDateHandler = () => {
  showDatePicker.value = false
}

const displayDate = ref('')
const blurInputHandler = () => {
  const tempDate = new Date(displayDate.value)
  // set to all dates to be in noon UTC to display correctly when showing current date in our timezone
  // and to avoid extensive calculation of PST vs PDT
  tempDate.setUTCHours(12, 0, 0, 0)
  updateDate(tempDate.toISOString())
}
</script>

<template>
  <UInput
    v-model.trim="displayDate"
    :data-testid="id"
    placeholder=""
    :aria-required="required"
    :disabled
    :maxlength
    class="w-full grow"
    :ui="{
      base: invalid ? 'ring-0 shadow-bcGovInputError focus:shadow-bcGovInputError' : '',
      icon: {
        trailing: { pointer: '' }
      }
    }"
    @focusin="showDatePicker = true"
    @blur="blurInputHandler"
    @change="changeDateHandler"
  >
    <label
      :for="id"
      class="floating-label-input"
      :class="invalid ? 'text-red-600' : ''"
    >
      {{ label }}
    </label>
    <template #trailing>
      <UIcon
        name="i-mdi-calendar"
        class="text-2xl
         text-bcGovColor-midGray"
        @click="showDatePicker = true"
      />
    </template>
  </UInput>
  <FormDatePicker
    v-if="showDatePicker"
    ref="dateSelectPickerRef"
    class="absolute z-20"
    :default-selected-date="selectedDate"
    :set-min-date="minDate"
    :set-max-date="maxDate"
    @selected-date="updateDate($event); showDatePicker = false; hasDateChanged = true"
  />
</template>
