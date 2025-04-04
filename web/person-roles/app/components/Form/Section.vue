<script setup lang="ts">
defineProps<{
  label: string
  invalid: boolean
}>()
</script>

<template>
  <fieldset class="flex flex-col gap-6">
    <legend
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
