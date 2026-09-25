<script setup lang="ts">
import { DateTime } from 'luxon'

const props = defineProps<{
  foundingDate?: string
  loading?: boolean
}>()

const { t } = useI18n()

const formattedDate = computed(() => {
  if (!props.foundingDate) {
    return t('label.unknown')
  }
  return toReadableDate(props.foundingDate, DateTime.DATETIME_FULL)
})
</script>

<template>
  <div class="flex gap-2 sm:gap-6 flex-col sm:flex-row py-4 sm:py-5 padding-x-default">
    <span class="text-neutral-highlighted font-bold w-full sm:basis-1/4">
      {{ $t('label.recognitionDateAndTime') }}
    </span>
    <USkeleton v-if="loading" class="h-6 w-2/3 sm:w-1/3" />
    <span v-else class="flex-1">{{ formattedDate }}</span>
  </div>
</template>
