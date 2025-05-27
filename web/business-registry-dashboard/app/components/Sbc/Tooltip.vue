<script setup lang="ts">
defineProps<{
  text: string
  id?: string
}>()

const isTouchScreen = useMediaQuery('(pointer: coarse)')
</script>
<template>
  <div class="inline-flex items-center align-text-top">
    <UPopover
      :mode="isTouchScreen ? 'click' : 'hover'"
    >
      <template #default="{ open }">
        <UButton
          type="button"
          :padded="false"
          variant="link"
          icon="i-mdi-info-outline"
          class="cursor-default"
          size="xl"
          :aria-label="open ? $t('btn.info.hide') : $t('btn.info.show')"
        />
        <!-- live region will announce text when button opens popover -->
        <span role="status" class="sr-only">
          {{ open ? text : '' }}
        </span>
        <!-- text for aria aria-describedby -->
        <p v-if="id" :id class="hidden">
          {{ text }}
        </p>
      </template>

      <template #panel>
        <p class="p-2.5 text-sm font-normal text-white">
          {{ text }}
        </p>
      </template>
    </UPopover>
  </div>
</template>
