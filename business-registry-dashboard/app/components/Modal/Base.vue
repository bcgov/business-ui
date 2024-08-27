<script setup lang="ts">
const modalModel = defineModel({ type: Boolean, default: false })

defineProps<{
  title?: string
  content?: string
  actions?: { label: string, handler:() => void }[]
  error?: {
    title: string
    description: string
  }
}>()
</script>
<template>
  <UModal v-model="modalModel">
    <UCard :ui="{ divide: '' }">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-xl font-semibold text-bcGovColor-darkGray">{{ title }}</span>
          <UButton
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
        </div>
      </slot>
      <template v-if="actions !== undefined || $slots.footer" #footer>
        <slot name="footer">
          <div v-if="actions !== undefined" class="flex items-center justify-center gap-4">
            <UButton
              v-for="(action, index) in actions"
              :key="index"
              :label="action.label"
              @click="action.handler"
            />
          </div>
        </slot>
      </template>
    </UCard>
  </UModal>
</template>
