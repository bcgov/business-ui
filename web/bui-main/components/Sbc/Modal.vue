<script setup lang="ts">
const modalModel = defineModel({ type: Boolean, default: false })

defineProps<{
  title: string
  content: string
  actions: { label: string, handler:() => void }[]
}>()
</script>
<template>
  <UModal v-model="modalModel">
    <UCard :ui="{ divide: '' }">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-xl font-semibold text-bcGovColor-darkGray">{{ title }}</span>
          <!-- eslint-disable vue/attribute-hyphenation -->
          <UButton
            :ui="{ icon: { base: 'shrink-0 scale-150' } }"
            icon="i-mdi-close"
            color="primary"
            :ariaLabel="$t('btn.close')"
            square
            variant="ghost"
            @click="modalModel = false"
          />
        </div>
      </template>
      <p class="text-bcGovColor-midGray">
        {{ content }}
      </p>
      <template #footer>
        <div class="flex items-center justify-center gap-4">
          <UButton
            v-for="(action, index) in actions"
            :key="index"
            :label="action.label"
            @click="action.handler"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
