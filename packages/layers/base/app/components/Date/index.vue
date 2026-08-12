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

const localState = reactive({ dateInput: dateModel.value ?? '' })

const isCalendarOpen = ref(false)
const calendarAnnouncement = ref('')
let suppressCalendarAnnouncement = false
watch(isCalendarOpen, (open) => {
  calendarAnnouncement.value = (open && !suppressCalendarAnnouncement)
    ? `Choose Date, ${calendarDisplayMonth.value}`
    : ''
  suppressCalendarAnnouncement = false
})
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

function onCalendarIconKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || event.shiftKey || !isCalendarOpen.value) {
    return
  }
  event.preventDefault()
  focusCalendarGrid()
}

const calendarMinValue = computed(() => toCalendarDate(props.minDate))
const calendarMaxValue = computed(() => toCalendarDate(props.maxDate))
const calendarValue = computed(() => toCalendarDate(localState.dateInput, DATE_DISPLAY_FORMAT))

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

const calendarDisplayMonth = computed(() =>
  DateTime.fromObject(
    { year: calendarPlaceholder.value.year, month: calendarPlaceholder.value.month, day: 1 },
    { locale: activeLocale.value }
  ).setLocale(activeLocale.value).toFormat('MMMM yyyy')
)

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
  localState.dateInput = formatDate(dt, DATE_DISPLAY_FORMAT)
  syncModelFromLocal()
  suppressCloseAutoFocus = true
  suppressOpenOnFocus = true
  isCalendarOpen.value = false
  nextTick(() => {
    inputWrapperRef.value?.querySelector<HTMLElement>(`#${inputId}`)?.focus()
  })
}

function onInputFocus() {
  suppressCalendarAnnouncement = true
  if (suppressOpenOnFocus) {
    suppressOpenOnFocus = false
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
  const trimmed = localState.dateInput.trim()

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
  const normalized = normalizeDate(localState.dateInput)
  if (normalized !== localState.dateInput) {
    localState.dateInput = normalized
  }
})

let debounceTimer: ReturnType<typeof setTimeout> | undefined
watch(() => localState.dateInput, (val: string) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!val) {
      syncModelFromLocal()
      return
    }
    const normalized = normalizeDate(val)
    if (normalized !== val) {
      localState.dateInput = normalized
      await nextTick()
    }
    syncModelFromLocal()
  }, 500)
})

function clearDate() {
  localState.dateInput = ''
  syncModelFromLocal()
}
</script>

<template>
  <div ref="inputWrapperRef">
    <UInput
      :id="inputId"
      v-model="localState.dateInput"
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
          v-if="localState.dateInput && !disabled"
          icon="i-mdi-close"
          type="button"
          :color="error ? 'error' : 'neutral'"
          variant="ghost"
          class="date-action-button"
          aria-label="Clear date"
          @keydown.enter.prevent="clearDate"
          @click="clearDate"
        />
        <!-- capture Enter before Reka UI asChild trigger strips the listener -->
        <span @keydown.capture.enter.prevent.stop="isCalendarOpen = !isCalendarOpen">
          <UPopover
            v-model:open="isCalendarOpen"
            :reference="inputWrapperRef ?? undefined"
            :content="{
              'side': 'top',
              'align': 'start',
              'onOpenAutoFocus': (e: Event) => e.preventDefault(),
              onCloseAutoFocus,
              'onFocusOutside': ignoreInputInteraction,
              'onInteractOutside': ignoreInputInteraction
            }"
          >
            <UButton
              icon="i-mdi-calendar"
              type="button"
              :disabled="disabled"
              :color="error && !localState.dateInput ? 'error' : 'neutral'"
              variant="ghost"
              class="date-action-button"
              aria-label="Open calendar"
              @keydown="onCalendarIconKeydown"
            />
            <template #content>
              <div ref="calendarContentRef">
                <UCalendar
                  aria-label="Choose Date"
                  :placeholder="calendarPlaceholder"
                  :model-value="calendarValue"
                  :min-value="calendarMinValue"
                  :max-value="calendarMaxValue"
                  @update:model-value="onDateSelect"
                />
              </div>
            </template>
          </UPopover>
        </span>
      </template>
    </UInput>
    <span
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >{{ calendarAnnouncement }}</span>
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
</style>
