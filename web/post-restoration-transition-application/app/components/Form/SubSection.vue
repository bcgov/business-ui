<script lang="ts">
export default {
  name: 'FormSubSection'
}
</script>

<script setup lang="ts">
defineProps<{
  title: string
  description?: { type: string | undefined, optional: true }
  icon?: { type: string | undefined, optional: true }
}>()
</script>

<template>
  <section
    :aria-labelledby="title"
    class="bg-bcGovColor-white mt-4 mb-2"
  >
    <div class="flex flex-row w-full bg-bcGovColor-gray2 pl-6 pr-6 pb-4 pt-4 items-center">
      <!-- todo: add icon here -->
      <!--      icon color: #38598A -->
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
    <!-- This slot will accept any HTML/components -->
    <div class="p-6">
      <slot />
    </div>
  </section>
</template>

<style scoped>
</style>
