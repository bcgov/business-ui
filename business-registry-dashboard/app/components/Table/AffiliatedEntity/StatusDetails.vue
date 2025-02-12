<script setup lang="ts">
import type { PropType } from 'vue'
const { t } = useI18n()

interface Message {
  message: string
  colour: string
  priority: number
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

const entityAlertMessages: Record<string, Message> = {
  [EntityAlertTypes.PROCESSING]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.PROCESSING}`),
    colour: 'text-blue-500',
    priority: 6
  },
  [EntityAlertTypes.FROZEN]: {
    message: t(`entityAlertTypes.${EntityAlertTypes.FROZEN}`),
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

const generateMessage = (status: string | { type: string, data: any }): Message | null => {
  if (typeof status === 'string') {
    return entityAlertMessages[status] || null
  }

  // Handle EXPIRED case with dynamic type
  if (status.type === EntityAlertTypes.EXPIRED) {
    return {
      message: t(`entityAlertTypes.${EntityAlertTypes.EXPIRED}`, status.data),
      colour: 'text-red-600',
      priority: 2
    }
  }

  if (status.type === EntityAlertTypes.FUTURE_EFFECTIVE) {
    const effectiveDateFormatted = formatEffectiveDate(status.data.effectiveDate)
    return {
      message: t(`entityAlertTypes.${EntityAlertTypes.FUTURE_EFFECTIVE}`, { effectiveDate: effectiveDateFormatted }),
      colour: 'text-blue-500',
      priority: 7
    }
  }

  return null
}

const makeMessages = () => {
  const temp: Message[] = []
  for (const detail of props.details) {
    const message = generateMessage(detail)
    if (message !== null) {
      temp.push(message)
    }
  }
  return temp.sort((m1, m2) => m1.priority - m2.priority)
}

const alertMessages = makeMessages()

const getIconForMessage = (message: Message) => {
  // Check priority to determine if it's a future effective message. Show information outline icon if it is.
  return message.priority === 7
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
