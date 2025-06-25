<script setup lang="ts">
defineProps<{
  title: string
  text?: string
  icon?: string
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
    <ConnectInfoBox
      :title="title"
      title-class="text-base"
      :content="text"
      content-class="text-base"
    />
  </div>
</template>

<style scoped>

</style>
