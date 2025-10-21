<script setup lang="ts">
import { toDateStr, toPacificDateTime } from '#imports'

defineProps<{ date: Date, disabled?: boolean }>()
</script>

<template>
  <UTooltip
    arrow
    :content="{ side: 'right' }"
    :disabled
    :text="toPacificDateTime(date)"
  >
    <span :class="{ 'underline decoration-dotted': !disabled }">
      {{ toDateStr(date) }}
    </span>
  </UTooltip>
</template>
