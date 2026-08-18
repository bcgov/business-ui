<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import { CalendarDate } from '@internationalized/date'
import { DateTime } from 'luxon'

const props = defineProps<{
  label: string
  minDate?: string
  maxDate?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  describedBy?: string
}>()

const { locale } = useI18n()

const DATE_API_INPUT_FORMAT = 'yyyy-MM-dd'
const DATE_DISPLAY_FORMAT = 'MMMM d, yyyy'
const DATE_INPUT_FORMATS = [
  'MMMM d, yyyy',
  'MMMM d yyyy',
  'MMM d, yyyy',
  'MMM d yyyy',
  'M/d/yyyy',
  'MM/dd/yyyy',
  'yyyy-MM-dd',
  'd MMMM yyyy',
  'd MMM yyyy'
]

const dateModel = defineModel<string>()

const inputId = `date-input-${useId()}`

const dateInput = ref(dateModel.value ?? '')

const isCalendarOpen = ref(false)
// tracks whether the calendar opened from input focus (suppresses auto-focus into calendar)
let calendarOpenedViaInput = false
const inputWrapperRef = useTemplateRef<HTMLElement>('inputWrapperRef')
const calendarContentRef = useTemplateRef<HTMLElement>('calendarContentRef')
let suppressCloseAutoFocus = false
let suppressOpenOnFocus = false

function onCloseAutoFocus(e: Event) {
  if (suppressCloseAutoFocus) {
    e.preventDefault()
    suppressCloseAutoFocus = false
  }
}

function ignoreInputInteraction(e: Event) {
  if (inputWrapperRef.value?.contains(e.target as Node)) {
    e.preventDefault()
  }
}

function onInputBlur(e: FocusEvent) {
  if (calendarContentRef.value?.contains(e.relatedTarget as Node)) {
    return
  }
  suppressCloseAutoFocus = true
  isCalendarOpen.value = false
}

function focusCalendarGrid() {
  nextTick(() => {
    calendarContentRef.value?.querySelector<HTMLElement>('button:not([disabled])')?.focus()
  })
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' || !isCalendarOpen.value) {
    return
  }
  event.preventDefault()
  focusCalendarGrid()
}

const calendarMinValue = computed(() => toCalendarDate(props.minDate))
const calendarMaxValue = computed(() => toCalendarDate(props.maxDate))
const calendarValue = computed(() => toCalendarDate(dateInput.value, DATE_DISPLAY_FORMAT))

const isDateUnavailable = (date: DateValue): boolean => {
  return (
    (!!calendarMinValue.value
      && date.compare(calendarMinValue.value) < 0)
    || (!!calendarMaxValue.value
      && date.compare(calendarMaxValue.value) > 0)
  )
}

const calendarPlaceholder = computed<CalendarDate>(() => {
  const today = new CalendarDate(
    DateTime.now().year,
    DateTime.now().month,
    DateTime.now().day
  )
  if (calendarMinValue.value && today.compare(calendarMinValue.value) < 0) {
    return calendarMinValue.value
  }
  if (calendarMaxValue.value && today.compare(calendarMaxValue.value) > 0) {
    return calendarMaxValue.value
  }
  return today
})

const activeLocale = computed(() => {
  if (typeof locale === 'string') {
    return locale
  }
  return locale.value || 'en-CA'
})

function parseDate(dateStr: string, format: string): DateTime {
  return DateTime.fromFormat(dateStr, format, { locale: activeLocale.value })
}

function formatDate(date: DateTime, format: string): string {
  return date.setLocale(activeLocale.value).toFormat(format)
}

function toCalendarDate(dateStr?: string, format = DATE_API_INPUT_FORMAT): CalendarDate | undefined {
  if (!dateStr) {
    return undefined
  }
  const dt = parseDate(dateStr, format)
  if (!dt.isValid) {
    return undefined
  }
  return new CalendarDate(dt.year, dt.month, dt.day)
}

function onDateSelect(date: DateValue | DateRange | DateValue[] | null | undefined) {
  if (!date || Array.isArray(date) || !('year' in date)) {
    return
  }
  const dt = DateTime.fromObject({ year: date.year, month: date.month, day: date.day }, { locale: activeLocale.value })
  dateInput.value = formatDate(dt, DATE_DISPLAY_FORMAT)
  syncModelFromLocal()
  suppressCloseAutoFocus = true
  suppressOpenOnFocus = true
  isCalendarOpen.value = false
  nextTick(() => {
    inputWrapperRef.value?.querySelector<HTMLElement>(`#${inputId}`)?.focus()
  })
}

function onOpenAutoFocus(e: Event) {
  if (calendarOpenedViaInput) {
    e.preventDefault()
    calendarOpenedViaInput = false
  }
  // else: let focus enter the calendar so the screen reader announces it naturally
}

function onInputFocus() {
  if (isCalendarOpen.value) {
    return // already open (e.g. Shift+Tab back to input)
  }
  calendarOpenedViaInput = true
  if (suppressOpenOnFocus) {
    suppressOpenOnFocus = false
    calendarOpenedViaInput = false
    return
  }
  isCalendarOpen.value = true
}

function normalizeDate(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    return input
  }

  if (parseDate(trimmed, DATE_DISPLAY_FORMAT).isValid) {
    return trimmed
  }

  // Ensure space between letters and digits, and after commas
  const preprocessed = trimmed
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/,(\S)/g, ', $1')
    .replace(/\b([a-z])/g, (_, c) => c.toUpperCase())

  for (const fmt of DATE_INPUT_FORMATS) {
    const dt = parseDate(preprocessed, fmt)
    if (dt.isValid) {
      return formatDate(dt, DATE_DISPLAY_FORMAT)
    }
  }

  // preserve original input (including spaces) while the user is still typing
  return input
}

function syncModelFromLocal() {
  const trimmed = dateInput.value.trim()

  if (!trimmed) {
    dateModel.value = ''
    return
  }

  const parsed = parseDate(trimmed, DATE_DISPLAY_FORMAT)
  if (!parsed.isValid) {
    dateModel.value = trimmed
    return
  }

  const formattedDate = formatDate(parsed, DATE_API_INPUT_FORMAT)
  dateModel.value = formattedDate
}

onMounted(() => {
  const normalized = normalizeDate(dateInput.value)
  if (normalized !== dateInput.value) {
    dateInput.value = normalized
  }
})

let debounceTimer: ReturnType<typeof setTimeout> | undefined
watch(dateInput, (val: string) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!val) {
      syncModelFromLocal()
      return
    }
    const normalized = normalizeDate(val)
    if (normalized !== val) {
      dateInput.value = normalized
      await nextTick()
    }
    syncModelFromLocal()
  }, 500)
})

function clearDate() {
  dateInput.value = ''
  syncModelFromLocal()
}
</script>

<template>
  <div ref="inputWrapperRef">
    <UInput
      :id="inputId"
      v-model="dateInput"
      :disabled="disabled"
      class="w-full"
      placeholder="&nbsp;"
      :aria-required="required"
      :aria-describedby="[describedBy].filter(Boolean).join(' ')"
      @focus="onInputFocus"
      @blur="onInputBlur"
      @keydown="onInputKeydown"
    >
      <label
        :for="inputId"
        :class="['floating-label-input', { 'text-red-500': error }]"
      >
        {{ label }}
      </label>
      <template #trailing>
        <UButton
          v-if="dateInput && !disabled"
          icon="i-mdi-close"
          type="button"
          :color="error ? 'error' : 'neutral'"
          variant="ghost"
          class="date-action-button"
          :aria-label="$t('label.clearDate')"
          @keydown.enter.prevent="clearDate"
          @click="clearDate"
        />
        <!-- capture Enter before Reka UI asChild trigger strips the listener -->
        <span @keydown.capture.enter.prevent.stop="isCalendarOpen = !isCalendarOpen">
          <UPopover
            v-model:open="isCalendarOpen"
            :reference="inputWrapperRef ?? undefined"
            :content="{
              side: 'top',
              align: 'start',
              onOpenAutoFocus,
              onCloseAutoFocus,
              onFocusOutside: ignoreInputInteraction,
              onInteractOutside: ignoreInputInteraction
            }"
          >
            <UButton
              icon="i-mdi-calendar"
              type="button"
              :disabled="disabled"
              :color="error && !dateInput ? 'error' : 'neutral'"
              variant="ghost"
              class="date-action-button"
              :aria-label="$t('label.openCalendar')"
            />
            <template #content>
              <div ref="calendarContentRef">
                <UCalendar
                  :aria-label="$t('label.chooseDate')"
                  :placeholder="calendarPlaceholder"
                  :model-value="calendarValue"
                  :min-value="calendarMinValue"
                  :max-value="calendarMaxValue"
                  :is-date-unavailable="isDateUnavailable"
                  @update:model-value="onDateSelect"
                />
              </div>
            </template>
          </UPopover>
        </span>
      </template>
    </UInput>
  </div>
</template>

<style scoped>
:deep(.date-action-button) {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  color: #1669BB;
}

:deep(.date-action-button:focus-visible) {
  box-shadow: 0 0 0 2px var(--ui-primary);
  border-radius: 1px;
}

:deep([data-slot="header"] button:focus-visible) {
  outline: 3px solid #1669BB;
  outline-offset: -4px;
  border-radius: 20%;
  background: transparent;
}

:deep([data-slot="cellTrigger"]:focus-visible) {
  outline: 2px solid #1669BB;
  border-radius: 50%;
}

:deep([data-slot="cellTrigger"][data-selected]) {
  border-radius: 50%;
}

:deep([data-slot="cellTrigger"][data-unavailable]) {
  text-decoration: none;
  color: #C3C3C3 !important;
}

:deep([data-slot="cellTrigger"][data-outside-view]) {
  color: #212529;
}
</style>
