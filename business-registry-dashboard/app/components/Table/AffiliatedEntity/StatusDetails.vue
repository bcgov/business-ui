<script setup lang="ts">
import type { PropType } from 'vue'

interface Message {
  message: string
  colour: string
  priority: number
}

const props = defineProps({
  details: {
    type: Array as PropType<Array<EntityAlertTypes>>,
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
    message: 'This name request is still processing, it may take up to 10 minutes.',
    colour: 'text-blue-500',
    priority: 5
  },
  [EntityAlertTypes.FROZEN]: {
    message: 'This business is frozen',
    colour: 'text-bcGovColor-caution',
    priority: 4
  },
  [EntityAlertTypes.BADSTANDING]: {
    message: 'This business is not in good standing',
    colour: 'text-bcGovColor-caution',
    priority: 3
  },
  [EntityAlertTypes.LIQUIDATION]: {
    message: 'This business is in liquidation',
    colour: 'text-red-600',
    priority: 2
  },
  [EntityAlertTypes.DISSOLUTION]: {
    message: 'This business is in the process of being dissolved',
    colour: 'text-red-600',
    priority: 1
  },
  [EntityAlertTypes.EXPIRED]: {
    message: 'This incorporation application is no longer valid; the name request is expired.',
    colour: 'text-red-600',
    priority: 5
  }
}

const generateMessage = (status: string): Message | null => {
  return entityAlertMessages[status] || null
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
</script>
<template>
  <UTooltip :popper="{ arrow: true }">
    <UIcon
      :name="icon"
      :class="alertMessages[0]?.colour"
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
</template>
