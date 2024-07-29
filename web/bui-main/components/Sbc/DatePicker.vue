<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
const { locale } = useI18n()

const dateModel = defineModel({ type: Date as PropType<Date | null>, default: null })

defineProps<{
  inputVariant: string
  maxDate?: Date
  minDate?: Date
  placeholder?: string
  arialabel?: string
}>()

const datePickerRef = ref<InstanceType<typeof VueDatePicker> | null>(null)

// leaving this for future reference
// function validateDateInput (input: string): Date | null {
//   const dateRegex = /^\d{4}-\d{2}-\d{2}$/
//   const inputDate = dateStringToDate(input) ?? null
//   const validDate = inputDate && (!props.maxDate || inputDate < props.maxDate)

//   if (!input || (input.match(dateRegex) !== null && validDate)) {
//     return inputDate
//   }

//   return null
// }
</script>
<template>
  <!-- required for UInput aria-label -->
  <!-- eslint-disable vue/attribute-hyphenation -->
  <VueDatePicker
    ref="datePickerRef"
    v-model="dateModel"
    auto-apply
    :action-row="{ showCancel: false, showNow: false, showPreview: false, showSelect: false }"
    calendar-cell-class-name="bcros-date-picker__calendar__day"
    calendar-class-name="bcros-date-picker__calendar"
    :locale
    :enable-time-picker="false"
    format="yyyy-MM-dd"
    text-input
    hide-offset-dates
    :clearable="false"
    :max-date="maxDate || ''"
    :min-date="minDate || ''"
    :week-start="0"
    arrow-navigation
    data-testid="date-picker"
  >
    <template #dp-input="{ value, onInput, onEnter, onTab, onKeypress, onPaste, onFocus, isMenuOpen }">
      <UInput
        :ui="{ icon: { base: isMenuOpen ? 'text-primary-500' : 'text-gray-700' } }"
        :value="value"
        :variant="inputVariant"
        icon="i-mdi-calendar"
        trailing
        :placeholder="placeholder || ''"
        :aria-label="arialabel || ''"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.tab.stop="onTab"
        @keyup="onKeypress"
        @paste="onPaste"
        @focus="onFocus"
      />
    </template>
  </VueDatePicker>
</template>
<style lang="scss">
@import '@vuepic/vue-datepicker/dist/main.css';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.bcros-date-picker {
  width: 300px;

  &__err {
    border: 1px solid theme('colors.bcGovColor.error');
    border-radius: 10px;
    box-shadow: 0px 0px 3px theme('colors.bcGovColor.error');
  }

  &__calendar {

    &__day {
      border-radius: 50%;
    }

    .dp__calendar_header {
      margin-top: 6px;

      .dp__calendar_header_item {
        font-size: 12px;
        font-weight: 500;
        color: theme('colors.bcGovColor.darkGray') !important;
        padding: 4px 0 0 0;
        width: 40px;
      }
    }
  }

  .dp__menu {
    border-radius: 10px;
    height: 329px;
  }

  .dp__main {
    width: 298px;
  }

  .dp__theme_light {
    --dp-background-color: #ffffff;
    --dp-text-color: #495057;
    --dp-hover-color: #E4EDF7;
    --dp-hover-text-color: #495057;
    --dp-hover-icon-color: #495057;
    --dp-primary-color: #1669bb;
    --dp-primary-text-color: #f8f5f5;
    --dp-secondary-color: #c0c4cc;
    --dp-border-color: #ddd;
    --dp-menu-border-color: #ddd;
    --dp-border-color-hover: #aaaeb7;
    --dp-disabled-color: #f6f6f6;
    --dp-scroll-bar-background: #f3f3f3;
    --dp-scroll-bar-color: #959595;
    --dp-success-color: #76d275;
    --dp-success-color-disabled: #a3d9b1;
    --dp-icon-color: #959595;
    --dp-danger-color: #ff6f60;
    --dp-highlight-color: rgba(25, 118, 210, 0.1);
  }
}
</style>
