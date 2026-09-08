<script setup lang="ts">
// wrapper/container component used in table (or similar) expansion slots when opening a sub-form
// to be used for single fields only
const {
  orientation = 'horizontal'
} = defineProps<{
  name?: string
  help?: string
  orientation?: 'horizontal' | 'vertical'
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
  <div class="flex flex-col gap-4">
    <div class="w-full">
      <UFormField
        :name
        :help
        class="grow flex-1"
      >
        <template #default="{ error }">
          <div class="w-full flex gap-4 items-center">
            <slot />
            <UButton
              v-if="orientation === 'horizontal'"
              variant="outline"
              :label="$t('label.cancel')"
              class="justify-center hidden lg:block"
              @click="$emit('cancel')"
            />
            <UButton
              v-if="orientation === 'horizontal'"
              :data-alert-focus-target="taskGuardConfig?.targetId"
              :aria-describedby="taskGuardConfig?.messageId"
              :label="$t('label.done')"
              class="justify-center hidden lg:block"
              @click="$emit('done')"
            />
          </div>
          <div
            v-if="!help && !error"
            class="h-4 mt-1"
          />
        </template>
      </UFormField>
    </div>
    <div
      :class="[
        'flex gap-2 ml-auto',
        { 'lg:hidden': orientation === 'horizontal' }
      ]"
    >
      <UButton
        variant="outline"
        :label="$t('label.cancel')"
        class="w-full lg:w-min justify-center"
        @click="$emit('cancel')"
      />
      <UButton
        :data-alert-focus-target="taskGuardConfig?.targetId"
        :aria-describedby="taskGuardConfig?.messageId"
        :label="$t('label.done')"
        class="w-full lg:w-min justify-center"
        @click="$emit('done')"
      />
    </div>
    <FormAlertMessage
      v-if="taskGuardConfig"
      :id="taskGuardConfig.messageId"
      :message="taskGuardConfig.message"
      class="w-full text-sm text-center lg:text-left"
    />
  </div>
</template>
