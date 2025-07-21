<script setup lang="ts">
import type { ConnectBtnControl } from '#imports'

const buttonControl = computed(() => useRoute().meta.buttonControl as ConnectBtnControl)
const leftButtons = computed(() => buttonControl.value?.leftButtons || [])
const rightButtons = computed(() => buttonControl.value?.rightButtons || [])
const leftAlertText = computed(() => buttonControl.value?.leftAlertText || undefined)
const rightAlertText = computed(() => buttonControl.value?.rightAlertText || undefined)
</script>

<template>
  <div
    class="bg-white py-8"
    data-testid="button-control"
  >
    <div class="app-inner-container">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div class="flex justify-center items-center gap-4 md:justify-start">
            <UButton
              v-for="(button, i) in leftButtons"
              :key="'left-button-' + i"
              class="max-w-fit px-7 py-3"
              v-bind="button"
              data-testid="button-control-left-button"
            />
            <p
              v-if="leftAlertText"
              class="text-red-600"
              role="alert"
            >
              {{ leftAlertText }}
            </p>
          </div>
        </div>
        <div>
          <div class="flex justify-center items-center gap-4 md:justify-end">
            <p
              v-if="rightAlertText"
              class="text-red-600"
              role="alert"
            >
              {{ rightAlertText }}
            </p>
            <UButton
              v-for="(button, i) in rightButtons"
              :key="'right-button-' + i"
              class="max-w-fit px-7 py-3"
              v-bind="button"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
