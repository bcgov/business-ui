<script setup lang="ts">
import type { PropType } from 'vue'
const { t } = useI18n()

interface Message {
  message: string // The message to display
  colour: string // The color class to apply
  priority: number // Priority value (lower number = higher priority)
  type?: string // Optional type identifier
  daysDiff?: number | string // Optional days difference
}

const props = defineProps({
  details: {
    type: Array as PropType<Array<EntityAlertTypes | { type: EntityAlertTypes, data: any }>>,
    required: true
  },
  showAlertHeader: {
    type: Boolean
  },
  icon: {
    type: String,
    required: true
  }
})

// Define message templates for each alert type with their priorities
// IMPORTANT: The priority system is essential - lower numbers have higher priority
// This means EXPIRED (priority 2) will override BADSTANDING (priority 4)
const entityAlertMessages: Record<string, Message> = {
  [EntityAlertTypes.PROCESSING]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.PROCESSING}`),
    colour: 'text-blue-500',
    priority: 7 // Lowest priority
  },
  [EntityAlertTypes.FROZEN]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.FROZEN}`),
    colour: 'text-bcGovColor-caution',
    priority: 6
  },
  [EntityAlertTypes.CHANGE_REQUESTED]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.CHANGE_REQUESTED}`),
    colour: 'text-bcGovColor-caution',
    priority: 5
  },
  [EntityAlertTypes.BADSTANDING]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.BADSTANDING}`),
    colour: 'text-bcGovColor-caution',
    priority: 4
  },
  [EntityAlertTypes.LIQUIDATION]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.LIQUIDATION}`),
    colour: 'text-red-600',
    priority: 3
  },
  [EntityAlertTypes.DISSOLUTION]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.DISSOLUTION}`),
    colour: 'text-red-600',
    priority: 1
  }
}

// Generate a message object from an alert detail
const generateMessage = (status: string | { type: string, data: any }): Message | null => {
  // Handle simple string alert types (e.g. BADSTANDING, FROZEN)
  if (typeof status === 'string') {
    return entityAlertMessages[status] || null
  }

  // Handle complex alert types with data (e.g. EXPIRED, FUTURE_EFFECTIVE)
  // EXPIRED alert - includes the type of entity that's expired
  if (status.type === EntityAlertTypes.EXPIRED) {
    return {
      message: t(`entityAlertTypes.${EntityAlertTypes.EXPIRED}`, status.data),
      colour: 'text-red-600',
      priority: 2, // High priority - will override BADSTANDING (priority 4)
      type: status.type
    }
  }
  // EXPIRING in 10 Days alert - includes the type of entity that's expiring soon
  if (status.type === EntityAlertTypes.EXPIRING_SOON) {
    const daysDiff = status.data.daysDiff
    let expiryMessageKey

    if (daysDiff === 0) {
      expiryMessageKey = 'today'
    } else if (daysDiff === 1) {
      expiryMessageKey = 'tomorrow'
    } else {
      expiryMessageKey = 'inDays'
    }
    return {
      message: t(`entityAlertTypes.${EntityAlertTypes.EXPIRING_SOON}.${expiryMessageKey}`, status.data),
      colour: 'text-bcGovColor-caution',
      priority: 2.5, // High priority - same as EXPIRED cant exists at the same time
      type: status.type,
      daysDiff: status.data?.daysDiff
    }
  }
  // FUTURE_EFFECTIVE alert - includes formatted date
  if (status.type === EntityAlertTypes.FUTURE_EFFECTIVE) {
    const effectiveDateFormatted = formatEffectiveDate(status.data.effectiveDate)
    return {
      message: t(`entityAlertTypes.${EntityAlertTypes.FUTURE_EFFECTIVE}`, { effectiveDate: effectiveDateFormatted }),
      colour: 'text-blue-500',
      priority: 8, // Lowest priority
      type: status.type
    }
  }

  return null
}

// Compute alert messages with correct priorities
const alertMessages = computed(() => {
  // HIGHEST PRIORITY: Special case for expired registrations
  // If we have an expired registration alert, ONLY show that message and ignore all others
  const expiredRegistrationAlert = props.details.find(detail =>
    typeof detail === 'object' &&
    detail.type === EntityAlertTypes.EXPIRED &&
    detail.data?.type === 'registration'
  )

  if (expiredRegistrationAlert) {
    // Generate the message for the expired registration
    const message = generateMessage(expiredRegistrationAlert)
    return message ? [message] : []
  }

  // For all other cases, process all details and filter by priority
  const temp: Message[] = []

  // This logic ensures EXPIRED alerts take precedence over BADSTANDING
  // Check if we have any EXPIRED alert
  const hasExpired = props.details.some(detail =>
    (typeof detail === 'object' && detail.type === EntityAlertTypes.EXPIRED) ||
    detail === EntityAlertTypes.EXPIRED
  )

  // If we have an EXPIRED alert, filter out BAD_STANDING
  const filteredDetails = hasExpired
    ? props.details.filter(detail =>
      (typeof detail === 'object' && detail.type !== EntityAlertTypes.BADSTANDING) ||
      detail !== EntityAlertTypes.BADSTANDING
    )
    : props.details

  // Process each detail into a message
  for (const detail of filteredDetails) {
    const message = generateMessage(detail)
    if (message !== null) {
      temp.push(message)
    }
  }
  // Sort by priority (lower number = higher priority)
  // This ensures the most important alert is first in the array
  return temp.sort((m1, m2) => m1.priority - m2.priority)
})

// Determine which icon to use for a message
const getIconForMessage = (message: Message) => {
  // FUTURE_EFFECTIVE uses information icon, others use the standard alert icon
  return message.type === EntityAlertTypes.FUTURE_EFFECTIVE
    ? 'i-mdi-information-outline'
    : props.icon
}
</script>
<template>
  <div>
    <UTooltip :popper="{ arrow: true }">
      <UIcon
        v-for="(message, i) in alertMessages"
        :key="i"
        :name="getIconForMessage(message)"
        :class="message.colour"
        class="size-5"
      />
      <template #text>
        <ul class="flex flex-col gap-1">
          <li
            v-for="message, i in alertMessages"
            :key="i"
          >
            {{ message.message }}
          </li>
        </ul>
      </template>
    </UTooltip>
    <div class="sr-only">
      <ul>
        <li
          v-for="message, i in alertMessages"
          :key="i"
        >
          {{ message.message }}
        </li>
      </ul>
    </div>
  </div>
</template>
