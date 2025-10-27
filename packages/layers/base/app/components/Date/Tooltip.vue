<script setup lang="ts">
import { DateTime } from 'luxon'

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
      {{ toFormattedDateStr(date, DateTime.DATE_MED) }}
    </span>
  </UTooltip>
</template>
