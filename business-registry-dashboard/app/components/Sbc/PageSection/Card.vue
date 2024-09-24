<script setup lang="ts">
defineProps<{
  heading?: string
  headingIcon?: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>()
</script>
<template>
  <UCard
    class="w-full"
    :ui="{
      rounded: 'rounded',
      header: {
        base: 'rounded-t',
        background: 'bg-bcGovColor-gray2',
        padding: 'px-4 py-5 sm:px-6',
      },
      body: {
        padding: 'px-0 py-0 sm:p-0',
      },
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <slot name="header-left">
          <component
            :is="headingLevel || 'h2'"
            class="flex items-center gap-2 font-semibold text-bcGovColor-darkGray dark:text-white"
          >
            <UIcon
              v-if="headingIcon"
              :name="headingIcon"
              class="size-6 shrink-0 text-bcGovColor-activeBlue"
            />
            <span>{{ heading }}</span>
          </component>
        </slot>
        <slot name="header-right" />
      </div>
    </template>
    <slot />
  </UCard>
</template>
