<script setup lang="ts">
const {
  titleClass = 'text-[smaller] font-bold italic tracking-wider',
  contentClass = 'line-clamp-6 break-words whitespace-normal'
} = defineProps<{
  title?: string
  titleClass?: string
  content?: string
  contentClass?: string
}>()
</script>

<template>
  <div class="flex w-full flex-col overflow-hidden sm:max-w-[300px] sm:pr-4">
    <strong
      v-if="title"
      :class="titleClass"
    >
      {{ title }}
    </strong>
    <div :class="contentClass">
      <slot>
        <p v-if="content">
          {{ content }}
        </p>
      </slot>
    </div>
  </div>
</template>
