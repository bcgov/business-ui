<script setup lang="ts">
import type { ModalButtonProps } from '~/interfaces'

const isSmallScreen = useMediaQuery('(max-width: 640px)')

defineProps<{
  title: string
  description: string
  dismissible: boolean
  buttons: ModalButtonProps[]
}>()
defineEmits<{ close: [] }>()
</script>

<template>
  <UModal
    overlay
    :title
    :description
    :dismissible
  >
    <template #content>
      <div class="p-10 flex flex-col gap-6">
        <div
          role="alert"
          class="flex flex-col gap-6 text-left"
        >
          <h2 class="text-2xl font-semibold text-bcGovColor-darkGray">
            {{ title }}
          </h2>
          <p>{{ description }}</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <template
            v-for="button in buttons"
            :key="button.label"
          >
            <UButton
              v-if="button.shouldClose"
              v-bind="button"
              :block="isSmallScreen"
              @click="$emit('close')"
            />
            <UButton
              v-else
              v-bind="button"
              :block="isSmallScreen"
            />
          </template>
        </div>
      </div>
    </template>
  </UModal>
</template>
