<script lang="ts">
export default {
  name: 'FormSubSection'
}
</script>

<script setup lang="ts">
defineProps<{
  title: string | undefined
  icon?: string
}>()
</script>

<template>
  <section
    :aria-label="title"
    class="bg-bcGovColor-white"
  >
    <slot name="title">
      <div
        v-if="title || icon"
        class="flex flex-row w-full bg-bcGovColor-gray2 pl-6 pr-6 pb-4 pt-4 items-center"
      >
        <div v-if="icon">
          <UIcon
            :name="icon"
            class="size-6 text-bcGovColor-nonClickable font-bold mt-1 mr-2"
          />
        </div>
        <div class="grow">
          <p class="text-base text-bcGovColor-darkGray font-semibold">
            {{ title }}
          </p>
        </div>
      </div>
    </slot>
    <!-- This slot will accept any HTML/components -->
    <slot name="default" />
  </section>
</template>

<style scoped>
</style>
