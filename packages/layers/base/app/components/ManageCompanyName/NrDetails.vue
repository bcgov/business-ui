<script setup lang="ts">
defineProps<{
  details?: {
    meta: {
      legalName: string
      nrNumber: string | undefined
    }
    info: {
      label: string
      value: string
    }[]
  }
}>()
</script>

<template>
  <div v-if="details" class="flex flex-col gap-4">
    <div class="flex flex-col text-neutral-highlighted">
      <span class="text-xl font-bold">{{ details.meta.legalName }}</span>
      <span class="text-lg">{{ details.meta.nrNumber }}</span>
    </div>
    <dl>
      <div
        v-for="item in details.info"
        :key="item.label"
        class="flex flex-row flex-wrap gap-2"
      >
        <dt class="font-bold text-neutral-highlighted">
          {{ item.label }}:
        </dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </div>
</template>
