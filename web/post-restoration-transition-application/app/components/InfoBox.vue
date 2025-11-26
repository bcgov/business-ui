<script setup lang="ts">
import OfficersInfoBox from '~/components/OfficersInfoBox.vue'

defineProps<{
  title: string
  text?: string
  icon?: string
  titleClass?: string
  textClass?: string
}>()
</script>

<template>
  <div class="flex flex-row bg-bcGovColor-white">
    <slot name="icon">
      <div
        v-if="icon"
        class="items-start"
      >
        <UIcon
          :name="icon"
          class="size-5 text-bcGovColor-nonClickable mr-[6px]"
        />
      </div>
    </slot>
    <!-- todo: find replacement -->
    <OfficersInfoBox
      :title="title"
      :title-class="titleClass"
      :content="text"
      :content-class="textClass"
    />
  </div>
</template>

<style scoped>

</style>
