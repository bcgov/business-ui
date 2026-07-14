<script setup lang="ts">
// wrapper/container component used in table (or similar) expansion slots when opening a sub-form
// to be used for single fields only
defineProps<{
  taskGuardConfig?: {
    message?: string
    messageId: string
    targetId: string
  }
}>()

defineEmits<{
  done: []
  cancel: []
}>()
</script>

<template>
  <div>
    <div
      class="flex flex-col xl:flex-row gap-2 xl:gap-6 items-center px-4 xl:px-8 pb-4 xl:pb-8"
    >
      <slot />
      <div class="flex flex-col xl:flex-row gap-2 xl:gap-6 justify-end items-center w-full xl:w-auto">
        <UButton
          variant="outline"
          :label="$t('label.cancel')"
          class="w-full xl:w-min justify-center"
          @click="$emit('cancel')"
        />
        <UButton
          :data-alert-focus-target="taskGuardConfig?.targetId"
          :aria-describedby="taskGuardConfig?.messageId"
          :label="$t('label.done')"
          class="w-full xl:w-min justify-center"
          @click="$emit('done')"
        />
      </div>
      <FormAlertMessage
        v-if="taskGuardConfig"
        :id="taskGuardConfig.messageId"
        :message="taskGuardConfig.message"
        class="w-full xl:max-w-md order-last xl:order-none text-sm text-center xl:text-right"
      />
    </div>
  </div>
</template>
