<script setup lang="ts">
defineProps<{
  label: string
  invalid: boolean
  errorId?: string
}>()

const legendId = useId()
</script>

<template>
  <fieldset
    class="flex flex-col gap-6"
    :aria-invalid="invalid"
    :aria-labelledby="`${legendId} ${errorId}`"
  >
    <legend
      :id="legendId"
      class="text-base text-bcGovGray-900 font-bold mb-4"
      :class="{
        'text-red-600': invalid
      }"
    >
      {{ label }}
    </legend>

    <slot />
  </fieldset>
</template>
