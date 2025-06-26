<script setup lang="ts">
import type { UButton } from '#components'
const modalModel = defineModel({ type: Boolean, default: false })
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const closeButtonRef = ref<InstanceType<typeof UButton> | null>(null)

defineProps<{
  title?: string
  actions?: { label: string, handler:() => void, color?: string, variant?: string }[]
  error?: {
    title: string
    description: string
    description2?: string
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
        <div v-if="title" class="flex items-center justify-between">
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
        <div v-if="error" class="-mb-4 -mt-12 flex flex-col gap-4">
          <div class="relative w-full">
            <h2 class="flex pb-4 text-xl font-semibold">
              {{ error.title }}
            </h2>
            <UButton
              v-if="!title"
              ref="closeButtonRef"
              icon="i-mdi-close"
              color="primary"
              :aria-label="$t('btn.close')"
              square
              variant="ghost"
              class="absolute right-0 top-0"
              @click="modalModel = false"
            />
          </div>
          <p>{{ error.description }}</p>
          <p v-if="error.description2">
            {{ error.description2 }}
          </p>
          <BCRegContactInfo v-if="error.showContactInfo" class="self-start text-left" />
        </div>
      </slot>
      <template v-if="actions !== undefined || $slots.footer" #footer>
        <slot name="footer">
          <div v-if="actions !== undefined" class="flex flex-wrap items-center justify-center gap-4 pt-2">
            <UButton
              v-for="(action, index) in actions"
              :key="index"
              :block="isSmallScreen"
              :label="action.label"
              :variant="action.variant || 'solid'"
              :color="action.color || 'primary'"
              class="px-7 py-3"
              @click="action.handler"
            />
          </div>
        </slot>
      </template>
    </UCard>
  </UModal>
</template>
