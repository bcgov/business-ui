<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const isSmallScreen = useMediaQuery('(max-width: 640px)')

defineProps<{
  title: string
  description: string
  buttons: ButtonProps[]
}>()
</script>

<template>
  <UModal
    id="officer-error-modal"
    overlay
    :title
    :description
    :dismissible="false"
  >
    <template #content>
      <div class="p-10 flex flex-col items-center text-center gap-6">
        <UIcon
          class="text-red-600 shrink-0 size-10"
          name="i-mdi-alert-circle-outline"
        />
        <div
          role="alert"
          class="flex flex-col gap-6"
        >
          <h2
            id="session-expired-dialog-title"
            class="text-2xl font-semibold text-bcGovColor-darkGray"
          >
            {{ title }}
          </h2>
          <p>{{ description }}</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <UButton
            v-for="button, i in buttons"
            :key="i"
            :block="isSmallScreen"
            v-bind="button"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
