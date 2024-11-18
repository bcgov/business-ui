<script setup lang="ts">
import type { UButton } from '#components'
const modalModel = defineModel({ type: Boolean, default: false })
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const closeButtonRef = ref<InstanceType<typeof UButton> | null>(null)

defineProps<{
  title?: string
  content?: string
  actions?: { label: string, handler:() => void, color?: string, variant?: string }[]
  error?: {
    title: string
    description: string
    showContactInfo?: boolean
  },
  fullscreen?: boolean
}>()

defineEmits<{
  modalClosed: [void]
}>()

// Remove focus from close button after modal mount to prevent it from being auto-focused
// This ensures the close button isn't immediately highlighted when the modal opens
onMounted(async () => {
  await nextTick()
  closeButtonRef.value?.$el?.blur()
})
</script>
<template>
  <UModal
    ref="modalRef"
    v-model="modalModel"
    :fullscreen
    :ui="{
      width: 'w-full sm:max-w-lg md:min-w-min'
    }"
    @after-leave="$emit('modalClosed')"
  >
    <UCard
      class="p-4"
      :ui="{
        divide: '',
        rounded: fullscreen ? 'rounded-none' : 'rounded-lg',
        base: fullscreen ? 'h-screen' : ''
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <span class="pb-3 text-xl font-semibold text-bcGovColor-darkGray">{{ title }}</span>
          <UButton
            ref="closeButtonRef"
            :ui="{ icon: { base: 'shrink-0 scale-150' } }"
            icon="i-mdi-close"
            color="primary"
            :aria-label="$t('btn.close')"
            square
            variant="ghost"
            @click="modalModel = false"
          />
        </div>
      </template>
      <slot>
        <p v-if="content" class="text-bcGovColor-midGray">
          {{ content }}
        </p>
        <div v-if="error" class="flex flex-col items-center gap-4 text-center">
          <UIcon name="i-mdi-alert-circle-outline" class="-mt-10 size-8 text-red-500" />
          <h2 class="text-xl font-semibold">
            {{ error.title }}
          </h2>
          <p>{{ error.description }}</p>
          <p v-if="error.showContactInfo" class="self-start">
            Please contact us if you require assistance.
          </p>
          <BCRegContactInfo v-if="error.showContactInfo" class="self-start text-left" />
        </div>
      </slot>
      <template v-if="actions !== undefined || $slots.footer" #footer>
        <slot name="footer">
          <div v-if="actions !== undefined" class="flex flex-wrap items-center justify-center gap-4">
            <UButton
              v-for="(action, index) in actions"
              :key="index"
              :block="isSmallScreen"
              :label="action.label"
              :variant="action.variant || 'solid'"
              :color="action.color || 'primary'"
              @click="action.handler"
            />
          </div>
        </slot>
      </template>
    </UCard>
  </UModal>
</template>
